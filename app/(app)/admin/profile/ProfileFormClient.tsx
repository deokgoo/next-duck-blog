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
      
      setMessage({ type: 'success', text: '프로필이 성공적으로 저장되었습니다.' });
      router.refresh();
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
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
          className={`p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Avatar Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          프로필 이미지
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex-shrink-0">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Avatar Preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 dark:border-gray-800 shadow-md"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-gray-50 flex items-center justify-center shadow-inner">
                <User className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-grow w-full max-w-sm">
            <p className="text-sm text-gray-500 mb-3">새로운 이미지를 업로드하여 프로필 사진을 변경하세요.</p>
            <ImageUploader 
              slug="avatars" 
              onImageInsert={handleImageInsert('avatar')} 
              className="bg-transparent border border-dashed border-gray-300 dark:border-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">기본 정보</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">소셜 링크</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="github" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
      </div>

      {/* Blog Metadata Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">블로그 설정</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="blogTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
            <label htmlFor="blogDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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

          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="flex-shrink-0 w-32">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">사이트 로고</p>
                {formData.siteLogo ? (
                  <img src={formData.siteLogo} alt="Site Logo" className="w-full h-auto object-contain bg-gray-100 dark:bg-gray-800 rounded p-2" />
                ) : (
                  <div className="w-full h-16 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded text-xs text-gray-500">없음</div>
                )}
              </div>
              <div className="flex-grow w-full">
                <ImageUploader slug="assets" onImageInsert={handleImageInsert('siteLogo')} className="bg-transparent border border-dashed border-gray-300 dark:border-gray-700" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="flex-shrink-0 w-32">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">파비콘 (아이콘)</p>
                {formData.favicon ? (
                  <img src={formData.favicon} alt="Favicon" className="w-16 h-16 object-cover bg-gray-100 dark:bg-gray-800 rounded p-2" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded text-xs text-gray-500">없음</div>
                )}
              </div>
              <div className="flex-grow w-full">
                <ImageUploader slug="assets" onImageInsert={handleImageInsert('favicon')} className="bg-transparent border border-dashed border-gray-300 dark:border-gray-700" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start border-t border-gray-200 dark:border-gray-800 pt-4">
              <div className="flex-shrink-0 w-32">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">소셜 배너 (OG Base)</p>
                {formData.socialBanner ? (
                  <img src={formData.socialBanner} alt="Social Banner" className="w-full h-auto object-cover bg-gray-100 dark:bg-gray-800 rounded p-2" />
                ) : (
                  <div className="w-full h-16 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded text-xs text-gray-500">없음</div>
                )}
              </div>
              <div className="flex-grow w-full">
                <ImageUploader slug="assets" onImageInsert={handleImageInsert('socialBanner')} className="bg-transparent border border-dashed border-gray-300 dark:border-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4">
        <Link
          href="/admin"
          className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>대시보드로 돌아가기</span>
        </Link>
        
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center space-x-2 rounded-lg bg-black px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-black/10 transition-all hover:bg-gray-800 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-black dark:shadow-white/10 dark:hover:bg-gray-100"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSaving ? '저장 중...' : '프로필 저장'}</span>
        </button>
      </div>
    </form>
  );
}
