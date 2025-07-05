'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Save,
  Plus,
  X,
  Check,
  Sparkles,
  BookOpen,
  Map,
  Star,
  PenTool,
  Keyboard,
  Palette,
} from 'lucide-react';
import MetadataPanel from './MetadataPanel';
import MarkdownEditor from './MarkdownEditor';

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  metadata: Partial<MDXMetadata>;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface MDXMetadata {
  title: string;
  date: string;
  tags: string[];
  summary: string;
  draft: boolean;
  slug: string;
}

const templates: Template[] = [
  {
    id: 'technical-blog',
    name: '기술 블로그',
    description: '기술 관련 포스트를 위한 템플릿',
    icon: BookOpen,
    color: 'blue',
    content: `# 기술 제목

## 개요
이 포스트에서는 [기술명]에 대해 설명합니다.

## 문제 상황
어떤 문제를 해결하고자 했는지 설명해주세요.

## 해결 방법
\`\`\`javascript
// 코드 예시
const solution = "여기에 코드를 작성하세요";
\`\`\`

## 결과
구현한 결과와 성과를 설명해주세요.

## 결론
배운 점이나 추후 개선사항을 정리해주세요.`,
    metadata: {
      tags: ['기술', '개발', '프로그래밍'],
      title: '새로운 기술 포스트',
      summary: '기술 관련 내용을 정리한 포스트입니다.',
      draft: true,
    },
  },
  {
    id: 'travel-blog',
    name: '여행 블로그',
    description: '여행 경험을 공유하는 포스트',
    icon: Map,
    color: 'green',
    content: `# 여행지 제목

## 여행 정보
- **여행 기간**: 
- **여행 인원**: 
- **예산**: 

## 여행 일정

### 1일차
아침부터 저녁까지의 일정을 작성해주세요.

![여행 사진](이미지 URL)

### 2일차
두 번째 날의 경험을 공유해주세요.

## 추천 포인트
- 꼭 가봐야 할 곳
- 맛집 추천
- 주의사항

## 마무리
여행 후기와 추천 여부를 작성해주세요.`,
    metadata: {
      tags: ['여행', '경험', '추천'],
      title: '새로운 여행 포스트',
      summary: '여행 경험을 공유하는 포스트입니다.',
      draft: true,
    },
  },
  {
    id: 'review-blog',
    name: '리뷰 블로그',
    description: '제품이나 서비스 리뷰 포스트',
    icon: Star,
    color: 'yellow',
    content: `# 제품/서비스 리뷰

## 기본 정보
- **제품명**: 
- **가격**: 
- **구매처**: 
- **평점**: ⭐⭐⭐⭐⭐

## 첫인상
처음 사용했을 때의 느낌을 적어주세요.

## 장점
- 좋았던 점 1
- 좋았던 점 2
- 좋았던 점 3

## 단점
- 아쉬웠던 점 1
- 아쉬웠던 점 2

## 사용 경험
실제 사용해본 후의 상세한 경험을 공유해주세요.

## 총평
전반적인 평가와 추천 여부를 작성해주세요.`,
    metadata: {
      tags: ['리뷰', '제품', '추천'],
      title: '새로운 리뷰 포스트',
      summary: '제품/서비스 리뷰 포스트입니다.',
      draft: true,
    },
  },
  {
    id: 'daily-blog',
    name: '일상 블로그',
    description: '일상과 생각을 공유하는 포스트',
    icon: PenTool,
    color: 'purple',
    content: `# 오늘의 이야기

## 오늘 하루

오늘 어떤 일이 있었는지 자유롭게 적어보세요.

## 느낀 점

하루를 마무리하며 든 생각들을 정리해보세요.

## 내일의 계획

내일은 무엇을 해볼까요?

---

*작성일: ${new Date().toLocaleDateString('ko-KR')}*`,
    metadata: {
      tags: ['일상', '회고', '생각'],
      title: '오늘의 이야기',
      summary: '일상을 기록하고 생각을 정리한 포스트입니다.',
      draft: true,
    },
  },
];

interface UltimateEditorProps {
  className?: string;
}

export default function UltimateEditor({ className = '' }: UltimateEditorProps) {
  // 메타데이터 상태
  const [metadata, setMetadata] = useState<MDXMetadata>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    tags: [],
    summary: '',
    draft: false,
    slug: '',
  });

  // 마크다운 콘텐츠 상태
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [hasChanges, setHasChanges] = useState(false);

  // UI 상태
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // 통계 계산
  const stats = {
    characters: content.length,
    words: content.trim() ? content.trim().split(/\s+/).length : 0,
    lines: content.split('\n').length,
    readingTime: Math.max(
      1,
      Math.ceil((content.trim() ? content.trim().split(/\s+/).length : 0) / 200)
    ),
  };

  // 자동 저장 (로컬 스토리지)
  const handleAutoSave = useCallback(() => {
    if (hasChanges) {
      setAutoSaveStatus('saving');

      try {
        localStorage.setItem('ultimate-editor-metadata', JSON.stringify(metadata));
        localStorage.setItem('ultimate-editor-content', content);

        setTimeout(() => {
          setAutoSaveStatus('saved');
          // setLastAutoSaved(new Date());

          setTimeout(() => {
            setAutoSaveStatus('idle');
          }, 2000);
        }, 500);
      } catch (error) {
        console.error('자동 저장 실패:', error);
        setAutoSaveStatus('idle');
      }
    }
  }, [metadata, content, hasChanges]);

  // 자동 저장 타이머 설정
  useEffect(() => {
    if (hasChanges) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 2000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasChanges, handleAutoSave]);

  // 로컬 스토리지에서 복원
  useEffect(() => {
    try {
      const savedMetadata = localStorage.getItem('ultimate-editor-metadata');
      const savedContent = localStorage.getItem('ultimate-editor-content');

      if (savedMetadata) {
        setMetadata(JSON.parse(savedMetadata));
      }

      if (savedContent) {
        setContent(savedContent);
      }
    } catch (error) {
      console.error('데이터 복원 실패:', error);
    }
  }, []);

  const handleMetadataChange = (newMetadata: MDXMetadata) => {
    setMetadata(newMetadata);
    setHasChanges(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(true);
  };

  const applyTemplate = (template: Template) => {
    setContent(template.content);
    setMetadata((prev) => ({
      ...prev,
      ...template.metadata,
      date: prev.date, // 날짜는 현재 날짜 유지
    }));
    setHasChanges(true);
    setShowTemplates(false);
  };

  const handleSave = async () => {
    if (!metadata.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setSaveStatus('saving');

    try {
      const response = await fetch('/api/blog/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('저장 실패');
      }

      const result = await response.json();
      console.log('저장 완료:', result);

      setSaveStatus('saved');
      setLastSaved(new Date());
      setHasChanges(false);

      // 저장 성공 메시지를 3초 후에 숨김
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('저장 실패:', error);
      setSaveStatus('error');
      alert('저장에 실패했습니다.');

      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewDocument = () => {
    if (hasChanges) {
      const confirmDiscard = window.confirm(
        '저장하지 않은 변경사항이 있습니다. 새 문서를 만들시겠습니까?'
      );
      if (!confirmDiscard) return;
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
    // setLastAutoSaved(null);

    // 로컬 스토리지 정리
    localStorage.removeItem('ultimate-editor-metadata');
    localStorage.removeItem('ultimate-editor-content');
  };

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'n':
            e.preventDefault();
            handleNewDocument();
            break;
          case 't':
            e.preventDefault();
            setShowTemplates(true);
            break;
          case '/':
            if (e.shiftKey) {
              // Ctrl+? (Ctrl+Shift+/)
              e.preventDefault();
              setShowShortcuts(true);
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 ${className}`}
    >
      <div className="mx-auto max-w-7xl">
        {/* 깔끔한 헤더 */}
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/80">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* 로고와 제목 */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                      Ultimate MDX Editor
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {stats.words}개 단어 • {stats.readingTime}분 읽기
                    </p>
                  </div>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center space-x-2">
                {/* 자동 저장 상태 */}
                {autoSaveStatus === 'saving' && (
                  <div className="flex items-center space-x-2 rounded-lg bg-blue-50 px-3 py-1 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <span className="text-xs font-medium">자동 저장 중</span>
                  </div>
                )}

                {autoSaveStatus === 'saved' && (
                  <div className="flex items-center space-x-2 rounded-lg bg-green-50 px-3 py-1 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    <Check className="h-3 w-3" />
                    <span className="text-xs font-medium">자동 저장됨</span>
                  </div>
                )}

                {/* 템플릿 */}
                <button
                  onClick={() => setShowTemplates(true)}
                  className="flex items-center space-x-2 rounded-lg bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/40"
                  title="템플릿 선택 (Ctrl+T)"
                >
                  <Palette className="h-4 w-4" />
                  <span>템플릿</span>
                </button>

                {/* 새 문서 */}
                <button
                  onClick={handleNewDocument}
                  className="flex items-center space-x-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  title="새 문서 (Ctrl+N)"
                >
                  <Plus className="h-4 w-4" />
                  <span>새 문서</span>
                </button>

                {/* 저장 버튼 */}
                <button
                  onClick={handleSave}
                  disabled={isLoading || !metadata.title.trim()}
                  className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  title="저장 (Ctrl+S)"
                >
                  <Save className="h-4 w-4" />
                  <span>{isLoading ? '저장 중...' : '저장'}</span>
                </button>
              </div>
            </div>

            {/* 저장 상태 알림 */}
            {(saveStatus === 'saved' || saveStatus === 'error') && (
              <div className="mt-3">
                {saveStatus === 'saved' && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <Check className="h-4 w-4" />
                    <span>성공적으로 저장되었습니다</span>
                    {lastSaved && (
                      <span className="text-green-500 dark:text-green-500">
                        • {lastSaved.toLocaleTimeString('ko-KR')}
                      </span>
                    )}
                  </div>
                )}

                {saveStatus === 'error' && (
                  <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                    <X className="h-4 w-4" />
                    <span>저장에 실패했습니다</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex flex-col gap-6 p-6">
          {/* 메타데이터 패널 - 상단 */}
          <div className="w-full">
            <MetadataPanel metadata={metadata} onMetadataChange={handleMetadataChange} />
          </div>

          {/* 마크다운 에디터 - 하단 */}
          <div className="w-full">
            <MarkdownEditor
              content={content}
              onContentChange={handleContentChange}
              onSave={handleSave}
              placeholder="마크다운으로 블로그 포스트를 작성하세요..."
              height="calc(100vh - 400px)"
              slug={metadata.slug}
            />
          </div>
        </div>

        {/* 하단 상태바 */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-white/90 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/90">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-6 text-slate-600 dark:text-slate-400">
                <span>{stats.characters} 문자</span>
                <span>{stats.words} 단어</span>
                <span>{stats.lines} 줄</span>
                <span>{stats.readingTime} 분 읽기</span>
              </div>

              <div className="flex items-center space-x-4 text-slate-500 dark:text-slate-400">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    metadata.draft
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  }`}
                >
                  {metadata.draft ? '초안' : '발행 준비됨'}
                </span>
                <span>{metadata.tags.length}개 태그</span>
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="transition-colors hover:text-slate-700 dark:hover:text-slate-300"
                  title="키보드 단축키"
                >
                  <Keyboard className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 템플릿 모달 */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">템플릿 선택</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {templates.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <div
                      key={template.id}
                      className="group cursor-pointer rounded-xl border border-slate-200 p-6 transition-all duration-200 hover:border-blue-300 hover:shadow-lg dark:border-slate-700 dark:hover:border-blue-600"
                      onClick={() => applyTemplate(template)}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-${template.color}-100 dark:bg-${template.color}-900/20 transition-transform group-hover:scale-110`}
                        >
                          <IconComponent
                            className={`h-6 w-6 text-${template.color}-600 dark:text-${template.color}-400`}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">
                            {template.name}
                          </h4>
                          <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {template.metadata.tags?.map((tag) => (
                              <span
                                key={tag}
                                className={`px-2 py-1 bg-${template.color}-50 dark:bg-${template.color}-900/20 text-${template.color}-700 dark:text-${template.color}-300 rounded-md text-xs font-medium`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 키보드 단축키 모달 */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">키보드 단축키</h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white">에디터 조작</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">저장</span>
                      <code className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                        Ctrl+S
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">새 문서</span>
                      <code className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                        Ctrl+N
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">템플릿 선택</span>
                      <code className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                        Ctrl+T
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">단축키 도움말</span>
                      <code className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                        Ctrl+?
                      </code>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white">텍스트 서식</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">굵게</span>
                      <code className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                        Ctrl+B
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">기울임</span>
                      <code className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                        Ctrl+I
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">링크</span>
                      <code className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                        Ctrl+K
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">실행 취소</span>
                      <code className="rounded bg-slate-100 px-2 py-1 font-mono text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                        Ctrl+Z
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
