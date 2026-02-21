'use client';

import React, { useState, useEffect } from 'react';
import { Save, FileText, Clock, AlignLeft, Hash } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import MetadataPanel from './MetadataPanel';
import MarkdownEditor from './MarkdownEditor';

interface IntegratedEditorProps {
  className?: string;
}

export default function IntegratedEditor({ className = '' }: IntegratedEditorProps) {
  const { user } = useAuth();
  // 메타데이터 상태
  const [metadata, setMetadata] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    tags: [] as string[],
    summary: '',
    draft: false,
    slug: '',
  });

  // 마크다운 콘텐츠 상태
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // 자동 저장 (로컬 스토리지)
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (hasChanges) {
        localStorage.setItem('integrated-editor-metadata', JSON.stringify(metadata));
        localStorage.setItem('integrated-editor-content', content);
        setLastSaved(new Date());
        setHasChanges(false);
      }
    }, 2000);

    return () => clearTimeout(autoSave);
  }, [metadata, content, hasChanges]);

  // 초기 데이터 로드
  useEffect(() => {
    const savedMetadata = localStorage.getItem('integrated-editor-metadata');
    const savedContent = localStorage.getItem('integrated-editor-content');

    if (savedMetadata) {
      try {
        setMetadata(JSON.parse(savedMetadata));
      } catch (error) {
        console.error('메타데이터 로드 실패:', error);
      }
    }

    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  // 변경사항 추적
  useEffect(() => {
    setHasChanges(true);
  }, [metadata, content]);

  // 메타데이터 업데이트
  const handleMetadataChange = (newMetadata: typeof metadata) => {
    setMetadata(newMetadata);
  };

  // 콘텐츠 업데이트
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  // 저장 함수
  const handleSave = async () => {
    if (!metadata.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setSaveStatus('saving');

    try {
      const token = await user?.getIdToken();
      // MDX 파일 저장
      const response = await fetch('/api/blog/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...metadata,
          content,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '저장 실패');
      }

      const result = await response.json();

      setSaveStatus('saved');
      setLastSaved(new Date());
      setHasChanges(false);

      // 성공 메시지 표시
      alert(`블로그 포스트가 성공적으로 저장되었습니다!\n경로: ${result.filePath}`);

      // 로컬 스토리지 정리
      localStorage.removeItem('integrated-editor-metadata');
      localStorage.removeItem('integrated-editor-content');
    } catch (error) {
      console.error('저장 실패:', error);
      setSaveStatus('error');
      alert(error instanceof Error ? error.message : '저장에 실패했습니다.');
    } finally {
      setIsLoading(false);

      // 상태 초기화
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  // 새 문서 시작
  const handleNewDocument = () => {
    if (hasChanges) {
      const confirmed = confirm(
        '저장하지 않은 변경사항이 있습니다. 정말로 새 문서를 시작하시겠습니까?'
      );
      if (!confirmed) return;
    }

    setMetadata({
      title: '',
      date: new Date().toISOString().split('T')[0],
      tags: [],
      summary: '',
      draft: false,
      slug: '',
    });
    setContent('');
    setHasChanges(false);
    setSaveStatus('idle');
    setLastSaved(null);

    // 로컬 스토리지 정리
    localStorage.removeItem('integrated-editor-metadata');
    localStorage.removeItem('integrated-editor-content');
  };

  // 통계 계산
  const stats = {
    characters: content.length,
    words: content.trim() ? content.trim().split(/\s+/).length : 0,
    lines: content.split('\n').length,
    readingTime: Math.ceil(content.trim().split(/\s+/).length / 200) || 1,
  };

  return (
    <div className={`mx-auto max-w-7xl space-y-6 p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
            <FileText className="mr-2 h-6 w-6" />
            통합 MDX 에디터
          </h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{stats.words} 단어</span>
            <span>•</span>
            <span>{stats.readingTime} 분 읽기</span>
            {hasChanges && (
              <>
                <span>•</span>
                <span className="text-orange-600">변경사항 있음</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* 저장 상태 */}
          {saveStatus === 'saving' && (
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <span className="text-sm">저장 중...</span>
            </div>
          )}

          {saveStatus === 'saved' && (
            <div className="flex items-center space-x-2 text-green-600">
              <span className="text-sm">저장됨</span>
            </div>
          )}

          {saveStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-600">
              <span className="text-sm">저장 실패</span>
            </div>
          )}

          {/* 마지막 저장 시간 */}
          {lastSaved && (
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>마지막 수정: {lastSaved.toLocaleString('ko-KR')}</span>
            </div>
          )}

          {/* 액션 버튼 */}
          <button
            onClick={handleNewDocument}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            새 문서
          </button>

          <button
            onClick={handleSave}
            disabled={isLoading || !metadata.title.trim()}
            className="flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isLoading ? '저장 중...' : '저장'}</span>
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 메타데이터 패널 */}
        <div className="lg:col-span-1">
          <MetadataPanel metadata={metadata} onMetadataChange={handleMetadataChange} />
        </div>

        {/* 마크다운 에디터 */}
        <div className="lg:col-span-2">
          <MarkdownEditor
            content={content}
            onContentChange={handleContentChange}
            onSave={handleSave}
            placeholder="마크다운으로 블로그 포스트를 작성하세요..."
            height="600px"
            slug={metadata.slug}
          />
        </div>
      </div>

      {/* 하단 상태바 */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center">
            <AlignLeft className="mr-1 h-4 w-4" />
            {stats.characters} 문자
          </span>
          <span className="flex items-center">
            <FileText className="mr-1 h-4 w-4" />
            {stats.words} 단어
          </span>
          <span className="flex items-center">
            <Hash className="mr-1 h-4 w-4" />
            {stats.lines} 줄
          </span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <span>발행 준비: {metadata.draft ? '초안' : '완성'}</span>
          <span>•</span>
          <span>태그: {metadata.tags.length}개</span>
        </div>
      </div>
    </div>
  );
}
