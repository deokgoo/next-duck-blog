'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Save,
  Plus,
  X,
  Check,
  Sparkles,
  Keyboard,
  FileText,
  LayoutTemplate,
  Eye,
} from 'lucide-react';
import MetadataPanel from './MetadataPanel';
import MarkdownEditor from './MarkdownEditor';
import TemplateSelector from './TemplateSelector';
import RealPreviewModal from './RealPreviewModal';
import SaveTemplateModal from './SaveTemplateModal';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import { useRouter, useSearchParams } from 'next/navigation';

import { Post } from '@/lib/types';
import { Template } from '@/lib/db/templates';

interface MDXMetadata {
  title: string;
  date: string;
  tags: string[];
  summary: string;
  draft: boolean;
  slug: string;
  layout?: string;
  images?: string[];
}


interface UltimateEditorProps {
  initialData?: Post | null;
  className?: string;
}

export default function UltimateEditor({ initialData, className = '' }: UltimateEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 메타데이터 상태
  const [metadata, setMetadata] = useState<MDXMetadata>({
    title: initialData?.title || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    tags: initialData?.tags || [],
    summary: initialData?.summary || '',
    draft: initialData?.draft ?? false,
    slug: initialData?.slug || '',
    layout: initialData?.layout || 'PostLayout',
    images: initialData?.images || [],
  });

  // 마크다운 콘텐츠 상태
  const [content, setContent] = useState(initialData?.content || '');
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [hasChanges, setHasChanges] = useState(false);

  // UI 상태
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // 확인 모달 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    isDangerous?: boolean;
    confirmText?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
    isDangerous: false,
  });

  // Refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

  // 서버 자동 저장 상태
  const [serverAutoSaveStatus, setServerAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const serverAutoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 스토리지 키 생성 함수
  const getStorageKey = (type: 'metadata' | 'content', slug?: string) => {
    const keySlug = slug || 'new';
    return `draft_${keySlug}_${type}`;
  };

  // 로컬 자동 저장 (기존 로직)
  const handleLocalAutoSave = useCallback(() => {
    if (hasChanges) {
      setAutoSaveStatus('saving');

      try {
        const currentSlug = metadata.slug;
        localStorage.setItem(getStorageKey('metadata', currentSlug), JSON.stringify(metadata));
        localStorage.setItem(getStorageKey('content', currentSlug), content);

        setTimeout(() => {
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        }, 500);
      } catch (error) {
        console.error('Local auto-save failed:', error);
        setAutoSaveStatus('idle');
      }
    }
  }, [metadata, content, hasChanges]);

  // 서버 자동 저장 (신규 로직)
  const handleServerAutoSave = useCallback(async () => {
    // 조건: 변경사항이 있고, 제목이 있어야 함
    if (!hasChanges || !metadata.title.trim()) return;
    
    // 조건: 'published' 상태인 기존 글은 자동 저장하지 않음 (실수 방지)
    // 단, 새 글(slug 없음)이거나 draft 상태면 저장
    const isNewPost = !initialData?.slug; // 초기 데이터가 없으면 새 글로 간주 (단, 수정 중인 새 글일 수도 있음)
    // 더 정확히: slug가 없거나, metadata.draft가 true일 때만
    
    // *중요*: 이미 발행된 글(initialData.draft === false)은 절대 자동 저장하면 안됨.
    // 하지만 사용자가 '발행됨' 상태에서 '초안'으로 바꿨다면? -> 저장 가능
    // 반대로 '초안'에서 '발행됨'으로 바꿨다면? -> 저장 가능 (의도적 변경)
    
    // 안전장치: 초기 상태가 'published'였다면, 사용자가 명시적으로 저장하기 전까지는 자동 저장 막기?
    // 기획: "오직 '새 글'이나 '초안(Draft)' 상태인 글에만 DB 자동 저장이 작동"
    
    if (!metadata.draft && initialData?.slug) {
        // 기존 글이고, 현재 상태가 Published라면 자동 저장 스킵
        return;
    }

    setServerAutoSaveStatus('saving');
    
    try {
        // API 호출 (기존 save API 사용)
        const response = await fetch('/api/blog/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ metadata, content }),
        });
        
        if (response.ok) {
            const result = await response.json();
            // 새 글이었다면 슬러그 업데이트 (중요: URL 변경은 하지 않음, 사용자 경험 위해)
            if (!metadata.slug && result.slug) {
                setMetadata(prev => ({ ...prev, slug: result.slug }));
                // URL을 조용히 업데이트? -> 아니오, 꼬일 수 있음. 그냥 내부 state만 업데이트.
            }
            setServerAutoSaveStatus('saved');
            setTimeout(() => setServerAutoSaveStatus('idle'), 3000);
            setLastSaved(new Date());
        } else {
            setServerAutoSaveStatus('error');
        }
    } catch (error) {
        console.error('Server auto-save failed:', error);
        setServerAutoSaveStatus('error');
    }
  }, [metadata, content, hasChanges, initialData]);

  // 자동 저장 타이머 설정 (로컬 + 서버)
  useEffect(() => {
    if (hasChanges) {
        // 1. 로컬 저장 (짧은 주기: 2초)
        if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
        autoSaveTimeoutRef.current = setTimeout(handleLocalAutoSave, 2000);
        
        // 2. 서버 저장 (긴 주기: 30초)
        if (serverAutoSaveTimeoutRef.current) clearTimeout(serverAutoSaveTimeoutRef.current);
        serverAutoSaveTimeoutRef.current = setTimeout(handleServerAutoSave, 30000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      if (serverAutoSaveTimeoutRef.current) clearTimeout(serverAutoSaveTimeoutRef.current);
    };
  }, [hasChanges, handleLocalAutoSave, handleServerAutoSave]);

  // 로컬 스토리지에서 복원 (검수: initialData가 없을 때만 실행)
  useEffect(() => {
    if (initialData) return;

    // URL에서 슬러그 확인
    const slugFromUrl = searchParams.get('slug') || undefined;

    try {
      const savedMetadata = localStorage.getItem(getStorageKey('metadata', slugFromUrl));
      const savedContent = localStorage.getItem(getStorageKey('content', slugFromUrl));

      if (savedMetadata) {
        const parsedMetadata = JSON.parse(savedMetadata);
        // 슬러그가 URL과 일치하는지 또는 둘 다 없는지 확인 (더 정교한 체크 가능)
        setMetadata(parsedMetadata);
      }

      if (savedContent) {
        setContent(savedContent);
      }
    } catch (error) {
      console.error('데이터 복원 실패:', error);
    }
  }, [initialData]);

  // Slug detection from URL for client-side fetching
  useEffect(() => {
    const slugFromUrl = searchParams.get('slug');
    
    // URL에 슬러그가 있으면 해당 포스트 데이터 로드
    if (slugFromUrl && !initialData) {
      // 이미 로컬 스토리지에서 로드된 데이터가 있고, 그 데이터의 슬러그가 url의 슬러그와 같다면 스킵할 수도 있음
      // 하지만 서버 데이터가 우선순위가 높을 수 있으므로 (또는 충돌 처리)
      // 여기서는 서버 데이터를 가져오되, 로컬에 저장된 draft가 더 최신이면 물어보는 로직이 있으면 좋음.
      // 현재는 간단하게 서버 데이터가 있으면 덮어씌움 (단, hasChanges가 false일 때만?)
      
      const fetchPostData = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/blog/get?slug=${slugFromUrl}`);
          if (res.ok) {
            const data = await res.json();
            const post = data.post;
            
            // TODO: 로컬 draft와 비교 로직 추가 가능
            
            setMetadata({
              title: post.title,
              date: post.date,
              tags: post.tags,
              summary: post.summary,
              draft: post.draft,
              slug: post.slug,
              layout: post.layout || 'PostLayout',
              images: post.images || [],
            });
            setContent(post.content);
            
            // 데이터 로드 후에는 변경 사항 없음으로 초기화
            setHasChanges(false); 
          }
        } catch (err) {
          console.error('Failed to fetch initial post data:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      // 변경사항이 없거나, 막 진입했을 때만 페칭
      if (!hasChanges) {
         fetchPostData();
      }
    } else if (!slugFromUrl && !initialData) {
        // 새 글 작성 모드인데, 기존에 'new' draft가 있으면 복원 (위의 useEffect에서 처리됨)
        // 하지만 만약 URL이 없는 상태로 왔는데 상태가 비어있지 않다면? (이전 state가 남아있는 경우)
        // 리셋 필요
        
        // 이 부분은 별도 useEffect로 분리하거나, 위 복원 로직과 통합 필요.
        // 여기서는 URL 변경 시 상태 리셋을 보장하기 위해 추가.
        
        // *중요*: 컴포넌트가 마운트될 때 draft_new를 복원하는 로직은 위의 useEffect에서 수행됨.
        // 여기서는 페이지 이동(CSR)으로 인해 slug가 사라졌을 때만 리셋을 고려.
    }
  }, [initialData, searchParams]); // 의존성 배열에서 hasChanges 제거 (무한 루프 방지)

  // URL 변경 감지하여 새 글 모드일 때 리셋 (Client Side Navigation 대응)
  useEffect(() => {
      const slugFromUrl = searchParams.get('slug');
      
      if (!slugFromUrl && !initialData) {
          // 새 글 모드
          // 만약 현재 state에 슬러그가 있다면 (이전 글을 보고 있었다면) 리셋
          if (metadata.slug && metadata.slug !== '') {
             handleNewDocument(false); // don't confirm, just reset logic usage
          }
      }
  }, [searchParams, initialData]);


  const handleMetadataChange = (newMetadata: MDXMetadata) => {
    setMetadata(newMetadata);
    setHasChanges(true);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(true);
  };

  const handleTemplateSelect = (templateContent: string) => {
    if (hasChanges) {
        setConfirmModal({
            isOpen: true,
            title: '탬플릿 적용 확인',
            message: '현재 작성 중인 내용이 탬플릿으로 대체됩니다. 계속하시겠습니까?',
            action: () => {
                setContent(templateContent);
                setHasChanges(true);
                setShowTemplateSelector(false);
            },
            isDangerous: true,
            confirmText: '덮어쓰기',
        });
        return;
    }
    
    // 변경사항이 없으면 바로 적용
    setContent(templateContent);
    setHasChanges(true);
    setShowTemplateSelector(false);
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
      
      // 저장 성공 시 해당 draft 삭제 (더 이상 임시 저장이 아님)
      const currentSlug = metadata.slug || ((result.slug) as string); // 저장 후 생성된 슬러그
      localStorage.removeItem(getStorageKey('metadata', currentSlug));
      localStorage.removeItem(getStorageKey('content', currentSlug));
      
      // 만약 새 글이었다면 'new' 키도 삭제
      if (!metadata.slug) {
          localStorage.removeItem(getStorageKey('metadata'));
          localStorage.removeItem(getStorageKey('content'));
          
          // 메타데이터에 슬러그 업데이트 (이제 기존 글임)
          setMetadata(prev => ({...prev, slug: currentSlug}));
          
          // URL 업데이트 (선택 사항: history.replaceState 등)
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('slug', currentSlug);
          window.history.replaceState({}, '', newUrl.toString());
      }

      // 저장 성공 메시지를 1.5초 보여준 뒤 리스트로 이동
      setTimeout(() => {
        setSaveStatus('idle');
        router.push('/admin');
      }, 1500);
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

  const handleNewDocument = (confirm = true) => {
    const startNewDocument = () => {
        setMetadata({
            title: '',
            date: new Date().toISOString().split('T')[0],
            tags: [],
            summary: '',
            draft: false,
            slug: '',
            layout: 'PostLayout',
            images: [],
        });
        setContent('');
        setHasChanges(false);
        setSaveStatus('idle');
        setLastSaved(null);
        
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('slug');
        window.history.pushState({}, '', newUrl.toString());

        localStorage.removeItem(getStorageKey('metadata'));
        localStorage.removeItem(getStorageKey('content'));
    };

    if (confirm && hasChanges) {
        setConfirmModal({
            isOpen: true,
            title: '새 문서 작성',
            message: '저장하지 않은 변경사항이 있습니다. 새 문서를 만드시겠습니까?',
            action: startNewDocument,
            isDangerous: true,
            confirmText: '새 문서 만들기',
        });
        return;
    }

    startNewDocument();
  };

  const handleTemplateCreate = async (templateData: Omit<Template, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      alert('탬플릿이 저장되었습니다.');
      setShowSaveTemplateModal(false);
    } catch (error) {
      console.error('Failed to create template:', error);
      alert('탬플릿 저장 중 오류가 발생했습니다.');
      throw error; // Re-throw to let modal handle loading state if needed
    }
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
      className={`min-h-screen bg-white dark:bg-black ${className}`}
    >
      <div className="mx-auto w-full max-w-[1920px]">
        {/* 깔끔한 헤더 */}
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/80">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* 로고와 제목 */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black dark:bg-white text-white dark:text-black">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                      포스트 작성
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {stats.words}개 단어 • {stats.readingTime}분 읽기
                    </p>
                  </div>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex items-center space-x-2">
                {/* 로컬 자동 저장 상태 */}
                {autoSaveStatus === 'saving' && (
                  <div className="flex items-center space-x-2 rounded-lg bg-blue-50 px-3 py-1 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <span className="text-xs font-medium">Local Saving</span>
                  </div>
                )}

                {autoSaveStatus === 'saved' && (
                  <div className="flex items-center space-x-2 rounded-lg bg-green-50 px-3 py-1 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                    <Check className="h-3 w-3" />
                    <span className="text-xs font-medium">Local Saved</span>
                  </div>
                )}

                {/* 서버 자동 저장 상태 */}
                {serverAutoSaveStatus === 'saving' && (
                  <div className="flex items-center space-x-2 rounded-lg bg-purple-50 px-3 py-1 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                    <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-purple-600 dark:border-purple-400"></div>
                    <span className="text-xs font-medium">Cloud Saving</span>
                  </div>
                )}

                {serverAutoSaveStatus === 'saved' && (
                  <div className="flex items-center space-x-2 rounded-lg bg-purple-50 px-3 py-1 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                    <Check className="h-3 w-3" />
                    <span className="text-xs font-medium">Cloud Saved</span>
                  </div>
                )}

                {/* 탬플릿 버튼 */}
                <div className="flex items-center space-x-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
                    <button
                        onClick={() => setShowTemplateSelector(true)}
                        className="flex items-center space-x-2 rounded px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-white hover:text-black hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                        title="탬플릿 불러오기"
                    >
                        <LayoutTemplate className="h-4 w-4" />
                        <span>불러오기</span>
                    </button>
                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-600"></div>
                    <button
                        onClick={() => setShowSaveTemplateModal(true)}
                        disabled={!content.trim()}
                        className="flex items-center space-x-2 rounded px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-white hover:text-black hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                        title="현재 내용을 탬플릿으로 저장"
                    >
                        <Save className="h-4 w-4" />
                        <span>탬플릿 저장</span>
                    </button>
                </div>


                {/* 미리보기 버튼 (New) */}
                <button
                  onClick={() => setShowPreview(true)}
                  className="flex items-center space-x-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  title="실전 미리보기"
                >
                  <Eye className="h-4 w-4" />
                  <span>미리보기</span>
                </button>

                {/* 새 문서 */}
                <button
                  onClick={() => handleNewDocument()}
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
                  className="flex items-center space-x-2 rounded-lg bg-black px-4 py-2 font-medium text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 dark:bg-white dark:text-black dark:hover:bg-gray-200"
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

      {/* 탬플릿 선택 모달 */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
      />

      {/* 탬플릿 저장 모달 */}
      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSave={handleTemplateCreate}
        initialContent={content}
      />

      {/* 실전 미리보기 모달 */}
      <RealPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={metadata.title}
        date={metadata.date}
        tags={metadata.tags}
        summary={metadata.summary}
        content={content}
        slug={metadata.slug}
      />

      {/* 확인 모달 */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.action}
        title={confirmModal.title}
        message={confirmModal.message}
        isDangerous={confirmModal.isDangerous}
        confirmText={confirmModal.confirmText}
      />
    </div>
  );
}
