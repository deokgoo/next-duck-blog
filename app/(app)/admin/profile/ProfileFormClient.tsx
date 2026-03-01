'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Authors } from '@/lib/types';
import ImageUploader from '@/components/editor/ImageUploader';
import { Save, ArrowLeft, Loader2, User } from 'lucide-react';
import Link from 'next/link';

interface ProfileFormClientProps {
  initialData: Authors;
}

export default function ProfileFormClient({ initialData }: ProfileFormClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Authors>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageInsert = (field: keyof Authors) => (markdownString: string) => {
    // markdownString is like `![alt](url)`
    // We just want the URL
    const urlMatch = markdownString.match(/\((.*?)\)/);
    if (urlMatch && urlMatch[1]) {
      setFormData((prev) => ({ ...prev, [field]: urlMatch[1] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/author/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: formData.slug || 'default', data: formData }),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      router.push('/admin');
    } catch (error) {
      setMessage({ type: 'error', text: '프로필 저장 중 오류가 발생했습니다.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Avatar Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100">
          <User className="h-5 w-5" />
          프로필 이미지
        </h3>

        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <div className="flex-shrink-0">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Avatar Preview"
                className="h-32 w-32 rounded-full border-4 border-gray-100 object-cover shadow-md dark:border-gray-800"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-gray-50 bg-gray-100 shadow-inner dark:bg-gray-800">
                <User className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <div className="w-full max-w-sm flex-grow">
            <p className="mb-3 text-sm text-gray-500">
              새로운 이미지를 업로드하여 프로필 사진을 변경하세요.
            </p>
            <ImageUploader
              slug="avatars"
              onImageInsert={handleImageInsert('avatar')}
              className="border border-dashed border-gray-300 bg-transparent dark:border-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">기본 정보</h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              이름
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white dark:focus:ring-white sm:text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white dark:focus:ring-white sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="occupation"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              직업 (Occupation)
            </label>
            <input
              type="text"
              id="occupation"
              name="occupation"
              value={formData.occupation || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white dark:focus:ring-white sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="company"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              회사 (Company)
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white dark:focus:ring-white sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Social Links Section */}
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">소셜 링크</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="github"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              GitHub URL
            </label>
            <input
              type="url"
              id="github"
              name="github"
              value={formData.github || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white dark:focus:ring-white sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="twitter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Twitter / X URL
            </label>
            <input
              type="url"
              id="twitter"
              name="twitter"
              value={formData.twitter || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white dark:focus:ring-white sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="linkedin"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              LinkedIn URL
            </label>
            <input
              type="url"
              id="linkedin"
              name="linkedin"
              value={formData.linkedin || ''}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white dark:focus:ring-white sm:text-sm"
            />
          </div>
        </div>

        {/* Visible Socials Selection */}
        <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
          <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            포스트 / 푸터에 표시할 소셜 링크
          </p>
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
            선택하지 않으면 모든 링크가 표시됩니다.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'email', label: 'Email' },
              { key: 'github', label: 'GitHub' },
              { key: 'twitter', label: 'Twitter / X' },
              { key: 'linkedin', label: 'LinkedIn' },
            ].map(({ key, label }) => {
              const checked = formData.visibleSocials?.includes(key) ?? false;
              return (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    checked
                      ? 'border-black bg-black/5 dark:border-white dark:bg-white/10'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setFormData((prev) => {
                        const current = prev.visibleSocials || [];
                        const next = checked ? current.filter((k) => k !== key) : [...current, key];
                        return { ...prev, visibleSocials: next };
                      });
                    }}
                    className="rounded border-gray-300 text-black focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-white"
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Blog Metadata Section */}
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">블로그 설정</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="blogTitle"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              블로그 제목
            </label>
            <input
              type="text"
              id="blogTitle"
              name="blogTitle"
              value={formData.blogTitle || ''}
              onChange={handleChange}
              placeholder="예: 내 블로그 | 기술 블로그"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white dark:focus:ring-white sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="blogDescription"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              블로그 설명
            </label>
            <textarea
              id="blogDescription"
              name="blogDescription"
              value={formData.blogDescription || ''}
              onChange={handleChange}
              rows={3}
              placeholder="블로그에 대한 소개를 작성해주세요."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white dark:focus:ring-white sm:text-sm"
            />
          </div>

          <div className="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-800">
            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <div className="w-32 flex-shrink-0">
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  사이트 로고
                </p>
                {formData.siteLogo ? (
                  <img
                    src={formData.siteLogo}
                    alt="Site Logo"
                    className="h-auto w-full rounded bg-gray-100 object-contain p-2 dark:bg-gray-800"
                  />
                ) : (
                  <div className="flex h-16 w-full items-center justify-center rounded bg-gray-100 text-xs text-gray-500 dark:bg-gray-800">
                    없음
                  </div>
                )}
              </div>
              <div className="w-full flex-grow">
                <ImageUploader
                  slug="assets"
                  onImageInsert={handleImageInsert('siteLogo')}
                  className="border border-dashed border-gray-300 bg-transparent dark:border-gray-700"
                />
              </div>
            </div>

            <div className="flex flex-col items-start gap-6 border-t border-gray-200 pt-4 dark:border-gray-800 sm:flex-row">
              <div className="w-32 flex-shrink-0">
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  파비콘 (아이콘)
                </p>
                {formData.favicon ? (
                  <img
                    src={formData.favicon}
                    alt="Favicon"
                    className="h-16 w-16 rounded bg-gray-100 object-cover p-2 dark:bg-gray-800"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100 text-xs text-gray-500 dark:bg-gray-800">
                    없음
                  </div>
                )}
              </div>
              <div className="w-full flex-grow">
                <ImageUploader
                  slug="assets"
                  onImageInsert={handleImageInsert('favicon')}
                  className="border border-dashed border-gray-300 bg-transparent dark:border-gray-700"
                />
              </div>
            </div>

            <div className="flex flex-col items-start gap-6 border-t border-gray-200 pt-4 dark:border-gray-800 sm:flex-row">
              <div className="w-32 flex-shrink-0">
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  소셜 배너 (OG Base)
                </p>
                {formData.socialBanner ? (
                  <img
                    src={formData.socialBanner}
                    alt="Social Banner"
                    className="h-auto w-full rounded bg-gray-100 object-cover p-2 dark:bg-gray-800"
                  />
                ) : (
                  <div className="flex h-16 w-full items-center justify-center rounded bg-gray-100 text-xs text-gray-500 dark:bg-gray-800">
                    없음
                  </div>
                )}
              </div>
              <div className="w-full flex-grow">
                <ImageUploader
                  slug="assets"
                  onImageInsert={handleImageInsert('socialBanner')}
                  className="border border-dashed border-gray-300 bg-transparent dark:border-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Link
          href="/admin"
          className="flex items-center space-x-2 text-sm font-medium text-gray-600 transition-colors hover:text-black dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>대시보드로 돌아가기</span>
        </Link>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center space-x-2 rounded-lg bg-black px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all hover:bg-gray-800 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-black dark:shadow-white/10 dark:hover:bg-gray-100"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{isSaving ? '저장 중...' : '프로필 저장'}</span>
        </button>
      </div>
    </form>
  );
}
