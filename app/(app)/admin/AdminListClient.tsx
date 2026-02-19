'use client';

import { useState, useRef, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { formatDate } from 'pliny/utils/formatDate';
import siteMetadata from '@/data/siteMetadata';
import { Post } from '@/lib/types';
import { Dialog, Transition } from '@headlessui/react';

interface AdminListClientProps {
  initialPosts: Post[];
}

import { useAuth } from '@/lib/auth/AuthContext';
import NextImage from 'next/image';

export default function AdminListClient({ initialPosts }: AdminListClientProps) {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState(initialPosts);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isHandlingDelete = useRef(false);
  const instanceId = useRef(Math.random().toString(36).substring(7));

  useEffect(() => {
    setMounted(true);
  }, []);

  const openDeleteModal = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`[${instanceId.current}] openDeleteModal triggered for:`, slug);
    setDeletingSlug(slug);
    setShowConfirmModal(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setShowConfirmModal(false);
    setDeletingSlug(null);
  };

  // 탭 필터 상태
  type TabType = 'all' | 'published' | 'draft';
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filteredPosts = posts.filter((post) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'published') return !post.draft;
    if (activeTab === 'draft') return post.draft;
    return true;
  });

  const confirmDelete = async () => {
    if (!deletingSlug || isHandlingDelete.current) return;
    
    const slug = deletingSlug;
    console.log(`[${instanceId.current}] confirmDelete started for:`, slug);
    isHandlingDelete.current = true;
    setIsDeleting(true);

    try {
      const res = await fetch('/api/blog/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug }),
      });

      console.log(`[${instanceId.current}] DELETE response:`, res.status);

      if (res.ok) {
        setPosts((prevPosts) => prevPosts.filter((p) => p.slug !== slug));
        setShowConfirmModal(false);
        setDeletingSlug(null);
        // Using a short timeout to ensure modal is closed before alert
        setTimeout(() => alert('포스트가 성공적으로 삭제되었습니다.'), 100);
      } else {
        const error = await res.json();
        alert(`삭제 실패: ${error.error}`);
      }
    } catch (err) {
      console.error('Error during deletion:', err);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
      isHandlingDelete.current = false;
      console.log(`[${instanceId.current}] confirmDelete finished for:`, slug);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative space-y-6">
      <div className="flex items-center justify-between">
        {/* 탭 필터 - 더 넓은 여백과 브랜드 컬러 적용 */}
        <div className="flex space-x-2 rounded-xl bg-gray-100/50 p-1.5 dark:bg-gray-800/50 w-fit border border-gray-200 dark:border-gray-700">
          {(['all', 'published', 'draft'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-200
                ${
                  activeTab === tab
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/10'
                    : 'text-gray-500 hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
                }
              `}
            >
              {tab === 'all' && '전체'}
              {tab === 'published' && '발행됨'}
              {tab === 'draft' && '초안'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-white pl-1 pr-3 py-1 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm">
            {user?.photoURL ? (
              <NextImage 
                src={user.photoURL} 
                alt="User Avatar" 
                width={28} 
                height={28} 
                className="rounded-full"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {user?.email}
            </span>
          </div>
          <button
            onClick={logout}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 border border-gray-200 transition-all dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-red-900/20 dark:hover:text-red-400 shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="w-full">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <tr>
              <th className="px-6 py-4 font-bold">Title</th>
              <th className="px-6 py-4 font-bold">Date</th>
              <th className="px-6 py-4 font-bold">Tags</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400 dark:text-gray-500 italic">
                  {activeTab === 'all'
                    ? '포스트가 없습니다.'
                    : activeTab === 'published'
                    ? '발행된 포스트가 없습니다.'
                    : '작성 중인 초안이 없습니다.'}
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr
                  key={post.slug}
                  className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-base">
                            <Link href={`/blog/${post.slug}`} className="hover:underline underline-offset-4 decoration-1 decoration-gray-400">
                              {post.title}
                            </Link>
                        </div>
                        {post.draft ? (
                            <span className="inline-flex items-center rounded-full border border-gray-300 dark:border-gray-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                              Draft
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-black dark:bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white dark:text-black">
                              Published
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1.5 font-mono">{post.slug}</div>
                  </td>
                  <td className="px-6 py-5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(post.date, siteMetadata.locale)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border border-transparent rounded uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end items-center gap-4">
                      <Link
                        href={`/editor?slug=${post.slug}`}
                        className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-bold text-xs uppercase tracking-tighter"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={(e) => openDeleteModal(e, post.slug)}
                        disabled={isDeleting && deletingSlug === post.slug}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 font-bold text-xs uppercase tracking-tighter transition-colors disabled:opacity-30"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Custom Confirmation Modal using Headless UI Dialog (Portal) */}
      <Transition appear show={showConfirmModal} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={closeDeleteModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-bold leading-6 text-gray-900 dark:text-white mb-2"
                  >
                    포스트 삭제
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      정말로 <span className="font-semibold text-red-500">"{deletingSlug}"</span> 포스트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors outline-none"
                      onClick={closeDeleteModal}
                      disabled={isDeleting}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 shadow-lg shadow-red-500/20 transition-all active:scale-95 outline-none"
                      onClick={confirmDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? '삭제 중...' : '삭제하기'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
