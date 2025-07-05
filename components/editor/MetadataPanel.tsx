'use client';

import { useState } from 'react';
import { Plus, X, Calendar, Hash, FileText, Settings, Save, Eye } from 'lucide-react';

export interface MDXMetadata {
  title: string;
  date: string;
  tags: string[];
  draft: boolean;
  summary: string;
  layout?: string;
  slug?: string;
  images?: string[];
}

interface MetadataPanelProps {
  metadata: MDXMetadata;
  onMetadataChange: (metadata: MDXMetadata) => void;
  onSave?: () => void;
  onPreview?: () => void;
  className?: string;
}

export default function MetadataPanel({
  metadata,
  onMetadataChange,
  onSave,
  onPreview,
  className = '',
}: MetadataPanelProps) {
  const [newTag, setNewTag] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const addTag = () => {
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      onMetadataChange({
        ...metadata,
        tags: [...metadata.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onMetadataChange({
      ...metadata,
      tags: metadata.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const updateMetadata = (key: keyof MDXMetadata, value: string | boolean | string[]) => {
    onMetadataChange({
      ...metadata,
      [key]: value,
    });
  };

  // 슬러그 자동 생성
  const generateSlug = () => {
    const slug = metadata.title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    updateMetadata('slug', slug);
  };

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 ${className}`}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">포스트 메타데이터</h2>
        </div>
        <div className="flex items-center space-x-2">
          {onPreview && (
            <button
              onClick={onPreview}
              className="rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
            >
              <Eye className="mr-1 h-4 w-4" />
              미리보기
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              className="rounded-md bg-green-100 px-3 py-1 text-sm text-green-700 transition-colors hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
            >
              <Save className="mr-1 h-4 w-4" />
              저장
            </button>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isCollapsed ? '펼치기' : '접기'}
          </button>
        </div>
      </div>

      {/* 메타데이터 폼 */}
      {!isCollapsed && (
        <div className="space-y-4 p-4">
          {/* 제목과 슬러그 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="title"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <FileText className="mr-1 inline h-4 w-4" />
                제목
              </label>
              <input
                id="title"
                type="text"
                value={metadata.title}
                onChange={(e) => updateMetadata('title', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="포스트 제목을 입력하세요"
              />
            </div>
            <div>
              <label
                htmlFor="slug"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Hash className="mr-1 inline h-4 w-4" />
                슬러그 (URL)
              </label>
              <div className="flex gap-2">
                <input
                  id="slug"
                  type="text"
                  value={metadata.slug || ''}
                  onChange={(e) => updateMetadata('slug', e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="URL 슬러그 (선택사항)"
                />
                <button
                  onClick={generateSlug}
                  className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                  title="제목에서 슬러그 자동 생성"
                >
                  자동생성
                </button>
              </div>
            </div>
          </div>

          {/* 날짜와 레이아웃 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="date"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Calendar className="mr-1 inline h-4 w-4" />
                발행일
              </label>
              <input
                id="date"
                type="date"
                value={metadata.date}
                onChange={(e) => updateMetadata('date', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="layout"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                레이아웃
              </label>
              <select
                id="layout"
                value={metadata.layout || ''}
                onChange={(e) => updateMetadata('layout', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">기본 레이아웃</option>
                <option value="PostLayout">포스트 레이아웃</option>
                <option value="PostSimple">간단한 포스트</option>
                <option value="PostBanner">배너 포스트</option>
              </select>
            </div>
          </div>

          {/* 요약 */}
          <div>
            <label
              htmlFor="summary"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              요약 (SEO 설명)
            </label>
            <textarea
              id="summary"
              value={metadata.summary}
              onChange={(e) => updateMetadata('summary', e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="포스트 요약을 입력하세요 (검색엔진과 소셜미디어에서 표시됩니다)"
            />
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {metadata.summary.length}/160자 (권장: 120-160자)
            </div>
          </div>

          {/* 태그 */}
          <div>
            <label
              htmlFor="tags"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              태그
            </label>
            <div className="mb-2 flex flex-wrap gap-2">
              {metadata.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 transition-colors hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                id="tags"
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="태그를 입력하고 Enter를 누르세요"
              />
              <button
                onClick={addTag}
                className="rounded-md bg-blue-600 px-3 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              태그는 포스트 분류와 검색에 사용됩니다
            </div>
          </div>

          {/* 상태 설정 */}
          <div className="flex items-center justify-between rounded-md bg-gray-50 p-3 dark:bg-gray-700">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={metadata.draft}
                  onChange={(e) => updateMetadata('draft', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">초안으로 저장</span>
              </label>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {metadata.draft ? (
                <span className="rounded bg-yellow-100 px-2 py-1 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  초안
                </span>
              ) : (
                <span className="rounded bg-green-100 px-2 py-1 text-green-800 dark:bg-green-900 dark:text-green-200">
                  발행됨
                </span>
              )}
            </div>
          </div>

          {/* 미리보기 정보 */}
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <h4 className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-200">미리보기</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <div className="font-medium">{metadata.title || '제목 없음'}</div>
              <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                {metadata.slug ? `/${metadata.slug}` : '/제목-기반-url'} • {metadata.date}
              </div>
              <div className="mt-1 line-clamp-2 text-xs">{metadata.summary || '요약 없음'}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {metadata.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded bg-blue-200 px-1 py-0.5 text-xs text-blue-800 dark:bg-blue-800 dark:text-blue-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
