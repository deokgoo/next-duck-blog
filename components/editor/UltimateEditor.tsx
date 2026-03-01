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
import { useAuth } from '@/lib/auth/AuthContext';

import { Post } from '@/lib/types';
import { Template } from '@/lib/db/templates';
import { saveDraft, getDraft, removeDraft, SavedDraft } from '@/lib/utils/localStorage';
interface MDXMetadata {
  title: string;
  date: string;
  tags: string[];
  summary: string;
  draft: boolean;
  slug: string;
  createdAt?: string; // Written Date
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
  const { user } = useAuth();
  const defaultDate = new Date();
  // Adjust to local time timezone offset then format exactly as YYYY-MM-DDTHH:mm
  const localIsoString = new Date(defaultDate.getTime() - defaultDate.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const [metadata, setMetadata] = useState<MDXMetadata>({
    title: initialData?.title || '',
    date: initialData?.date || localIsoString,
    tags: initialData?.tags || [],
    summary: initialData?.summary || '',
    draft: initialData?.status === 'draft',
    slug: initialData?.slug || '',
    createdAt: initialData?.createdAt || defaultDate.toISOString().split('T')[0],
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
  const [serverAutoSaveStatus, setServerAutoSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const serverAutoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 스토리지 키 생성 함수
  const getStorageKey = (type: 'metadata' | 'content', slug?: string) => {
    const keySlug = slug || 'new';
    return `draft_${keySlug}_${type}`;
  };

  // 로컬 자동 저장 (기존 로직)
  const handleLocalAutoSave = useCallback(() => {
    // 새 글 작성 시에만 자동 저장 동작
    // BUG FIX: initialData is always null, so we must check metadata.slug which is fetched from server for existing posts.
    // If metadata has a slug, that means it's an existing post (either from initialData or fetched later).
    // Wait, metadata.slug is '' for new posts. For existing posts, it's the post slug.
    const isNewPost = !metadata.slug;

    if (hasChanges && isNewPost) {
      setAutoSaveStatus('saving');

      try {
        const currentSlug = metadata.slug;
        saveDraft(getStorageKey('metadata', currentSlug), metadata);
        saveDraft(getStorageKey('content', currentSlug), content);

        setTimeout(() => {
          setAutoSaveStatus('saved');
          setTimeout(() => setAutoSaveStatus('idle'), 2000);
        }, 500);
      } catch (error) {
        console.error('Local auto-save failed:', error);
        setAutoSaveStatus('idle');
      }
    }
  }, [metadata, content, hasChanges, metadata.slug]);

  // 서버 자동 저장 (신규 로직)
  const handleServerAutoSave = useCallback(async () => {
    // 조건: 변경사항이 있고, 제목이 있어야 함
    if (!hasChanges || !metadata.title.trim()) return;

    // 조건: 새 글 작성 시에만 자동 저장 동작 (수정 모드에선 비활성화)
    const isNewPost = !metadata.slug;

    if (!isNewPost) {
      return;
    }

    setServerAutoSaveStatus('saving');

    try {
      // API 호출 (기존 save API 사용)
      const token = await user?.getIdToken();
      const response = await fetch('/api/blog/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ metadata, content }),
      });

      if (response.ok) {
        const result = await response.json();
        // 새 글이었다면 슬러그 업데이트 (중요: URL 변경은 하지 않음, 사용자 경험 위해)
        if (!metadata.slug && result.slug) {
          setMetadata((prev) => ({ ...prev, slug: result.slug }));
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

  // 로컬 스토리지에서 복원
  useEffect(() => {
    if (initialData) return;

    // URL에서 슬러그 확인
    const slugFromUrl = searchParams.get('slug') || undefined;

    // 새 글 작성이 아닌 경우(URL에 슬러그가 있는 경우) 복원 로직 건너뜀
    // 참고: SSR 단계에서 데이터를 불러오지 못해 initialData가 없는데 slug가 있다면 존재하지 않는 글일 확률이 높음.
    if (slugFromUrl) return;

    try {
      const savedMetadataDraft = getDraft<MDXMetadata>(getStorageKey('metadata', slugFromUrl));
      const savedContentDraft = getDraft<string>(getStorageKey('content', slugFromUrl));

      if (savedMetadataDraft || savedContentDraft) {
        const latestTime = savedMetadataDraft?.savedAt || savedContentDraft?.savedAt;
        const formattedTime = latestTime
          ? new Date(latestTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
          : '';

        const shouldRestore = window.confirm(
          `이전에 작성 중이던 임시 저장된 글이 있습니다 (${formattedTime}). 불러오시겠습니까?`
        );

        if (shouldRestore) {
          if (savedMetadataDraft?.data) {
            setMetadata(savedMetadataDraft.data);
          }
          if (savedContentDraft?.data) {
            setContent(savedContentDraft.data);
          }
        } else {
          // 거부할 경우 임시 저장 삭제
          removeDraft(getStorageKey('metadata', slugFromUrl));
          removeDraft(getStorageKey('content', slugFromUrl));
        }
      }
    } catch (error) {
      console.error('데이터 복원 실패:', error);
    }
  }, [initialData, searchParams]);

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
      const token = await user?.getIdToken();
      const response = await fetch('/api/blog/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
      const currentSlug = metadata.slug || (result.slug as string); // 저장 후 생성된 슬러그
      removeDraft(getStorageKey('metadata', currentSlug));
      removeDraft(getStorageKey('content', currentSlug));

      // 만약 새 글이었다면 'new' 키도 삭제
      if (!metadata.slug) {
        removeDraft(getStorageKey('metadata'));
        removeDraft(getStorageKey('content'));

        // 메타데이터에 슬러그 업데이트 (이제 기존 글임)
        setMetadata((prev) => ({ ...prev, slug: currentSlug }));

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
      const localIsoStringForReset = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setMetadata({
        title: '',
        date: localIsoStringForReset,
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

      removeDraft(getStorageKey('metadata'));
      removeDraft(getStorageKey('content'));
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
    <div className={`min-h-screen bg-white dark:bg-black ${className}`}>
      <div className="mx-auto w-full max-w-[1920px]">
        {/* 깔끔한 헤더 */}
        <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/80">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* 로고와 제목 */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
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
