'use client';

import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, RefreshCw } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote';
import { components } from '@/components/MDXComponents';
import PostLayout from '@/layouts/PostLayout';
import { CoreContent, Post, Authors } from '@/lib/types';

interface RealPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  content: string;
  slug: string;
}

export default function RealPreviewModal({
  isOpen,
  onClose,
  title,
  date,
  tags,
  summary,
  content,
  slug,
}: RealPreviewModalProps) {
  const [mdxSource, setMdxSource] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && content) {
      fetchPreview();
    }
  }, [isOpen, content]);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const data = await response.json();
      setMdxSource(data.mdxSource);
    } catch (err) {
      console.error('Preview Error:', err);
      setError('Failed to load preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Mock post object for layout
  const post: CoreContent<Post> = {
    title,
    date,
    tags,
    summary,
    slug: slug || 'preview-slug',
    lastmod: date,
    draft: true,
    layout: 'PostLayout',
    bibliography: '',
    canonicalUrl: '',
    authors: ['default'],
  };

  // Mock author details (can be fetched or hardcoded for preview)
  const authorDetails: CoreContent<Authors>[] = [
    {
      name: 'Preview Author', // Replace with dynamic if available
      avatar: '/static/images/avatar.png',
      occupation: 'Writer',
      company: 'Next.js Blog',
      email: 'address@yoursite.com',
      twitter: 'https://twitter.com/Twitter',
      linkedin: 'https://www.linkedin.com',
      github: 'https://github.com',
      layout: 'AuthorLayout',
      slug: 'default',
      date: '',
      title: '',
    },
  ];

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-7xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-gray-900">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/80">
                  <Dialog.Title as="h3" className="text-lg font-bold text-gray-900 dark:text-white">
                    Real Preview
                  </Dialog.Title>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={fetchPreview}
                      className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      title="Refresh Preview"
                    >
                      <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={onClose}
                      className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="h-[80vh] overflow-y-auto bg-white dark:bg-gray-950">
                  {loading && !mdxSource ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
                        <p className="text-gray-500">Generating preview...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex flex-col items-center space-y-4 text-center">
                        <p className="text-red-500">{error}</p>
                        <button
                          onClick={fetchPreview}
                          className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : mdxSource ? (
                    <PostLayout content={post} authorDetails={authorDetails}>
                      <MDXRemote {...mdxSource} components={components} />
                    </PostLayout>
                  ) : null}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
