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
  createdAt?: string; // Written Date
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
          <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">포스트 메타데이터</h2>
        </div>
        <div className="flex items-center space-x-2">
          {onPreview && (
            <button
              onClick={onPreview}
              className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <Eye className="mr-1 h-4 w-4" />
              미리보기
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              className="rounded-md bg-black px-3 py-1 text-sm text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
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
                  className="flex-1 rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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

          {/* 날짜, 레이아웃, 전시 상태 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="createdAt"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Calendar className="mr-1 inline h-4 w-4" />
                작성 날짜 (Written Date)
              </label>
              <input
                id="createdAt"
                type="date"
                value={metadata.createdAt || ''}
                onChange={(e) => updateMetadata('createdAt', e.target.value)}
                className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white mb-4"
              />
              <label
                htmlFor="date"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Calendar className="mr-1 inline h-4 w-4" />
                전시 시작 시간 (Publish Time)
              </label>
              <input
                id="date"
                type="datetime-local"
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
                className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white mb-4"
              >
                <option value="">기본 레이아웃</option>
                <option value="PostLayout">포스트 레이아웃</option>
                <option value="PostSimple">간단한 포스트</option>
                <option value="PostBanner">배너 포스트</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Settings className="mr-1 inline h-4 w-4" />
                전시 여부
              </label>
              <div className="flex items-center space-x-3 mt-3">
                <button
                  type="button"
                  onClick={() => updateMetadata('draft', !metadata.draft)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    !metadata.draft ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                >
                  <span className="sr-only">전시 상태 토글</span>
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      !metadata.draft ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${!metadata.draft ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                  {metadata.draft ? '비전시 (Draft)' : '전시 (Published)'}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                비전시 상태일 경우 목록에 노출되지 않으며 수정 상태로 유지됩니다. 전시 상태이더라도 시작 시간이 지나지 않으면 예약됨 상태가 됩니다.
              </p>
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
              className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-200"
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
                className="flex-1 rounded-md border border-gray-300 p-2 focus:border-transparent focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="태그를 입력하고 Enter를 누르세요"
              />
              <button
                onClick={addTag}
                className="rounded-md bg-gray-900 px-3 py-2 text-white transition-colors hover:bg-black dark:bg-gray-100 dark:text-black dark:hover:bg-white"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              태그는 포스트 분류와 검색에 사용됩니다
            </div>
          </div>

          {/* 전시 설정 */}
          <div className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              전시 설정
            </span>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="displayStatus"
                  checked={!metadata.draft}
                  onChange={() => updateMetadata('draft', false)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  전시 (Public)
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="displayStatus"
                  checked={metadata.draft}
                  onChange={() => updateMetadata('draft', true)}
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  비전시 (Private)
                </span>
              </label>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              * 설정한 <strong>전시 시작 시간</strong>이 도래해야만 실제 사용자 화면에 노출됩니다.
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
                    className="rounded bg-gray-200 px-1 py-0.5 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-200"
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
