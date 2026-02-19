'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Bold,
  Italic,
  Link,
  Image,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  EyeOff,
  Save,
  Hash,
  Plus,
  X,
  FileText,
  Settings,
  Keyboard,
  Download,
  Clock,
  Check,
  Layout,
} from 'lucide-react';

interface MDXMetadata {
  title: string;
  date: string;
  tags: string[];
  draft: boolean;
  summary: string;
  layout?: string;
  slug?: string;
  images?: string[];
}

interface WysiwygEditorProps {
  initialContent?: string;
  initialMetadata?: MDXMetadata;
  onSave?: (content: string, metadata: MDXMetadata) => void;
  onPreview?: (content: string) => void;
  onAutoSave?: (content: string, metadata: MDXMetadata) => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  metadata: Partial<MDXMetadata>;
}

const templates: Template[] = [
  {
    id: 'technical-blog',
    name: '기술 블로그',
    description: '기술 관련 포스트를 위한 템플릿',
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
      layout: 'PostLayout',
    },
  },
  {
    id: 'travel-blog',
    name: '여행 블로그',
    description: '여행 경험을 공유하는 포스트',
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
      layout: 'PostLayout',
    },
  },
  {
    id: 'review-blog',
    name: '리뷰 블로그',
    description: '제품이나 서비스 리뷰 포스트',
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
      layout: 'PostLayout',
    },
  },
];

export default function AdvancedWysiwygEditor({
  initialContent = '',
  initialMetadata,
  onSave,
  onPreview,
  onAutoSave,
}: WysiwygEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [metadata, setMetadata] = useState<MDXMetadata>(
    initialMetadata || {
      title: '',
      date: new Date().toISOString().split('T')[0],
      tags: [],
      draft: true,
      summary: '',
    }
  );
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLivePreview, setIsLivePreview] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [lastModified, setLastModified] = useState<string>('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 단어 수와 읽기 시간 계산
  const calculateStats = useCallback((text: string) => {
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    const readingTimeMinutes = Math.ceil(words / 200); // 평균 200단어/분
    setWordCount(words);
    setReadingTime(readingTimeMinutes);
  }, []);

  // 자동 저장
  const handleAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (content.trim() || metadata.title.trim()) {
        setAutoSaveStatus('saving');
        onAutoSave?.(content, metadata);
        setTimeout(() => setAutoSaveStatus('saved'), 1000);
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
      }
    }, 2000);
  }, [content, metadata, onAutoSave]);

  // 키보드 단축키 핸들러
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          insertText('**', '**');
          break;
        case 'i':
          e.preventDefault();
          insertText('*', '*');
          break;
        case 'k':
          e.preventDefault();
          insertText('[', '](url)');
          break;
        case 's':
          e.preventDefault();
          handleSave();
          break;
        case 'p':
          e.preventDefault();
          handlePreview();
          break;
        case '1':
          e.preventDefault();
          insertAtLineStart('# ');
          break;
        case '2':
          e.preventDefault();
          insertAtLineStart('## ');
          break;
        case '3':
          e.preventDefault();
          insertAtLineStart('### ');
          break;
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    calculateStats(content);
    handleAutoSave();
  }, [content, calculateStats, handleAutoSave]);

  // 클라이언트에서만 날짜 설정
  useEffect(() => {
    setLastModified(
      new Date().toLocaleDateString('ko-KR') + ' ' + new Date().toLocaleTimeString('ko-KR')
    );
  }, []);

  // 텍스트 삽입 함수
  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = content.substring(start, end);

    const newText = before + selectedText + after;
    const newContent = content.substring(0, start) + newText + content.substring(end);

    setContent(newContent);

    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = selectedText
          ? start + before.length + selectedText.length + after.length
          : start + before.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // 줄 시작에 텍스트 삽입
  const insertAtLineStart = (prefix: string) => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const lines = content.split('\n');
    let charCount = 0;
    let lineIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        lineIndex = i;
        break;
      }
      charCount += lines[i].length + 1;
    }

    lines[lineIndex] = prefix + lines[lineIndex];
    setContent(lines.join('\n'));
  };

  // 코드 블록 삽입
  const insertCodeBlock = (language: string = '') => {
    const codeBlock = `\`\`\`${language}\n// 코드를 입력하세요\n\`\`\`\n`;
    insertText(codeBlock);
  };

  // 이미지 업로드
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    const imageMarkdown = `![${file.name}](${imageUrl})\n`;
    insertText(imageMarkdown);
  };

  // 태그 관리
  const addTag = () => {
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      setMetadata((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // 템플릿 적용
  const applyTemplate = (template: Template) => {
    setContent(template.content);
    setMetadata((prev) => ({
      ...prev,
      ...template.metadata,
      title: template.name,
      date: new Date().toISOString().split('T')[0],
    }));
    setShowTemplates(false);
  };

  // MDX 생성
  const generateFrontmatter = () => {
    const frontmatter = [
      '---',
      `title: '${metadata.title}'`,
      `date: '${metadata.date}'`,
      `tags: [${metadata.tags.map((tag) => `'${tag}'`).join(', ')}]`,
      `draft: ${metadata.draft}`,
      `summary: '${metadata.summary}'`,
      ...(metadata.layout ? [`layout: ${metadata.layout}`] : []),
      ...(metadata.slug ? [`slug: ${metadata.slug}`] : []),
      ...(metadata.images
        ? [`images: [${metadata.images.map((img) => `'${img}'`).join(', ')}]`]
        : []),
      '---',
      '',
    ].join('\n');

    return frontmatter;
  };

  const generateMDX = () => {
    return generateFrontmatter() + content;
  };

  // 저장 및 미리보기
  const handleSave = () => {
    const fullContent = generateMDX();
    onSave?.(fullContent, metadata);
  };

  const handlePreview = () => {
    const fullContent = generateMDX();
    onPreview?.(fullContent);
    setIsPreviewMode(!isPreviewMode);
  };

  // 내보내기
  const handleExport = () => {
    const fullContent = generateMDX();
    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.slug || metadata.title || 'post'}.mdx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl rounded-lg bg-white p-4 shadow-lg dark:bg-gray-900">
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">고급 MDX 에디터</h1>
          <div className="ml-4 flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">{wordCount} 단어</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{readingTime}분 읽기</span>
            {autoSaveStatus === 'saving' && (
              <span className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                <Clock className="mr-1 h-3 w-3" />
                저장 중...
              </span>
            )}
            {autoSaveStatus === 'saved' && (
              <span className="flex items-center text-sm text-green-600 dark:text-green-400">
                <Check className="mr-1 h-3 w-3" />
                자동 저장됨
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="rounded-md bg-purple-100 px-3 py-2 text-purple-700 transition-colors hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800"
            title="템플릿 선택"
          >
            <Layout className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsLivePreview(!isLivePreview)}
            className="rounded-md bg-orange-100 px-3 py-2 text-orange-700 transition-colors hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-300 dark:hover:bg-orange-800"
            title="실시간 미리보기"
          >
            {isLivePreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="rounded-md bg-gray-100 px-3 py-2 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            title="단축키 보기"
          >
            <Keyboard className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="rounded-md bg-gray-100 px-3 py-2 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            title="메타데이터 설정"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={handleExport}
            className="rounded-md bg-indigo-100 px-3 py-2 text-indigo-700 transition-colors hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
            title="MDX 파일 내보내기"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handlePreview}
            className="rounded-md bg-blue-100 px-3 py-2 text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
          >
            <Eye className="mr-1 h-4 w-4" />
            {isPreviewMode ? '편집' : '미리보기'}
          </button>
          <button
            onClick={handleSave}
            className="rounded-md bg-green-100 px-3 py-2 text-green-700 transition-colors hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
          >
            <Save className="mr-1 h-4 w-4" />
            저장
          </button>
        </div>
      </div>

      {/* 템플릿 선택 모달 */}
      {showTemplates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
              템플릿 선택
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  onClick={() => applyTemplate(template)}
                >
                  <h4 className="mb-2 font-semibold text-gray-800 dark:text-white">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowTemplates(false)}
                className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 단축키 안내 */}
      {showShortcuts && (
        <div className="mb-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900">
          <h3 className="mb-2 font-semibold text-blue-800 dark:text-blue-200">키보드 단축키</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300 md:grid-cols-3">
            <div>
              <kbd>Ctrl/⌘ + B</kbd>: 굵게
            </div>
            <div>
              <kbd>Ctrl/⌘ + I</kbd>: 기울임
            </div>
            <div>
              <kbd>Ctrl/⌘ + K</kbd>: 링크
            </div>
            <div>
              <kbd>Ctrl/⌘ + S</kbd>: 저장
            </div>
            <div>
              <kbd>Ctrl/⌘ + P</kbd>: 미리보기
            </div>
            <div>
              <kbd>Ctrl/⌘ + 1-3</kbd>: 헤더
            </div>
          </div>
        </div>
      )}

      {/* 메타데이터 패널 */}
      {showMetadata && (
        <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">메타데이터</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="title"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                제목
              </label>
              <input
                id="title"
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="포스트 제목을 입력하세요"
              />
            </div>
            <div>
              <label
                htmlFor="date"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                날짜
              </label>
              <input
                id="date"
                type="date"
                value={metadata.date}
                onChange={(e) => setMetadata((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="slug"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                슬러그
              </label>
              <input
                id="slug"
                type="text"
                value={metadata.slug || ''}
                onChange={(e) => setMetadata((prev) => ({ ...prev, slug: e.target.value }))}
                className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="URL 슬러그 (선택사항)"
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
                onChange={(e) => setMetadata((prev) => ({ ...prev, layout: e.target.value }))}
                className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">기본 레이아웃</option>
                <option value="PostLayout">포스트 레이아웃</option>
                <option value="PostSimple">간단한 포스트</option>
                <option value="PostBanner">배너 포스트</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="summary"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                요약
              </label>
              <textarea
                id="summary"
                value={metadata.summary}
                onChange={(e) => setMetadata((prev) => ({ ...prev, summary: e.target.value }))}
                className="w-full rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="포스트 요약을 입력하세요"
              />
            </div>
            <div className="md:col-span-2">
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
                    className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-600">
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
                  className="flex-1 rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="태그를 입력하세요"
                />
                <button
                  onClick={addTag}
                  className="rounded-md bg-blue-600 px-3 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={metadata.draft}
                  onChange={(e) => setMetadata((prev) => ({ ...prev, draft: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">초안</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 도구 모음 */}
      <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
        <div className="flex flex-wrap gap-2">
          {/* 텍스트 서식 */}
          <div className="mr-2 flex items-center border-r border-gray-300 pr-2 dark:border-gray-600">
            <button
              onClick={() => insertText('**', '**')}
              className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="굵게 (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertText('*', '*')}
              className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="기울임 (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertText('`', '`')}
              className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="인라인 코드"
            >
              <Code className="h-4 w-4" />
            </button>
          </div>

          {/* 헤더 */}
          <div className="mr-2 flex items-center border-r border-gray-300 pr-2 dark:border-gray-600">
            <button
              onClick={() => insertAtLineStart('# ')}
              className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="헤더 1 (Ctrl+1)"
            >
              <Heading1 className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertAtLineStart('## ')}
              className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="헤더 2 (Ctrl+2)"
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertAtLineStart('### ')}
              className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="헤더 3 (Ctrl+3)"
            >
              <Heading3 className="h-4 w-4" />
            </button>
          </div>

          {/* 리스트 */}
          <div className="mr-2 flex items-center border-r border-gray-300 pr-2 dark:border-gray-600">
            <button
              onClick={() => insertAtLineStart('- ')}
              className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="불릿 리스트"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertAtLineStart('1. ')}
              className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="번호 리스트"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertAtLineStart('> ')}
              className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="인용"
            >
              <Quote className="h-4 w-4" />
            </button>
          </div>

          {/* 미디어 및 링크 */}
          <div className="flex items-center">
            <button
              onClick={() => insertText('[', '](url)')}
              className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="링크 (Ctrl+K)"
            >
              <Link className="h-4 w-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="이미지 업로드"
            >
              <Image className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertCodeBlock('javascript')}
              className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="코드 블록"
            >
              <Hash className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 에디터 영역 */}
      <div className={`grid gap-4 ${isLivePreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* 편집 영역 */}
        {(!isPreviewMode || isLivePreview) && (
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-96 w-full resize-none rounded-lg border border-gray-300 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="여기에 MDX 내용을 작성하세요..."
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
              {content.length} 글자
            </div>
          </div>
        )}

        {/* 미리보기 영역 */}
        {(isPreviewMode || isLivePreview) && (
          <div className="h-96 overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 dark:border-gray-600 dark:bg-gray-800">
            <div className="prose max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap font-mono text-sm">{generateMDX()}</pre>
            </div>
          </div>
        )}
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* 상태 표시 */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          {metadata.draft ? (
            <span className="rounded bg-yellow-100 px-2 py-1 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              초안
            </span>
          ) : (
            <span className="rounded bg-green-100 px-2 py-1 text-green-800 dark:bg-green-900 dark:text-green-200">
              발행됨
            </span>
          )}
          <span>단어 수: {wordCount}</span>
          <span>읽기 시간: {readingTime}분</span>
        </div>
        <div>{lastModified && `마지막 수정: ${lastModified}`}</div>
      </div>
    </div>
  );
}
