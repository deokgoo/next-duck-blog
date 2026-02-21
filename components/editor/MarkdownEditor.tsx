'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Minus,
  Eye,
  EyeOff,
  Save,
  Undo,
  Redo,
  FileText,
  X,
  FileCode,
  Images,
} from 'lucide-react';

interface MarkdownEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onSave?: () => void;
  placeholder?: string;
  height?: string;
  className?: string;
  slug?: string;
}

export default function MarkdownEditor({
  content,
  onContentChange,
  onSave,
  placeholder = '마크다운으로 작성하세요...',
  height = '600px',
  className = '',
  slug = '',
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageMode, setImageMode] = useState<'single' | 'double' | null>(null);
  const [doubleImageData, setDoubleImageData] = useState<{ first?: string; second?: string }>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const secondFileInputRef = useRef<HTMLInputElement>(null);

  // 히스토리 관리
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 통계 계산
  const stats = {
    characters: content.length,
    words: content.trim() ? content.trim().split(/\s+/).length : 0,
    lines: content.split('\n').length,
    readingTime: Math.max(1, Math.ceil((content.trim() ? content.trim().split(/\s+/).length : 0) / 200)),
  };

  useEffect(() => {
    // 외부에서 내용이 주입된 경우 (예: 로드, 템플릿 등) 및 동기화
    if (content !== history[historyIndex] && !typingTimerRef.current) {
      setHistory((prev) => {
        // 최초 로드 시(빈 문자열로 시작했고 새 데이터 도착) 히스토리를 덮어씌움
        if (prev.length === 1 && prev[0] === '' && content !== '') {
          return [content];
        }
        const newHistory = [...prev.slice(0, historyIndex + 1), content];
        if (newHistory.length > 50) newHistory.shift();
        return newHistory;
      });
      setHistoryIndex((prev) => (history.length === 1 && history[0] === '' && content !== '' ? 0 : Math.min(prev + 1, 49)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const addToHistory = useCallback(
    (newContent: string) => {
      setHistory((prev) => {
        if (prev[historyIndex] === newContent) return prev;
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newContent);
        if (newHistory.length > 50) newHistory.shift();
        return newHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    },
    [historyIndex]
  );

  const handleContentChange = (newContent: string) => {
    onContentChange(newContent);
    // 타이핑 디바운스 처리
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      addToHistory(newContent);
      typingTimerRef.current = null;
    }, 1000);
  };

  // 이미지 삽입 헬퍼 함수
  const handleImageInsert = (imageMarkdown: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeSelection = content.substring(0, start);
    const afterSelection = content.substring(end);

    // 새 줄에 이미지 추가
    const needsNewLineBefore = beforeSelection && !beforeSelection.endsWith('\n');
    const needsNewLineAfter = afterSelection && !afterSelection.startsWith('\n');

    const newContent =
      beforeSelection +
      (needsNewLineBefore ? '\n' : '') +
      imageMarkdown +
      (needsNewLineAfter ? '\n' : '') +
      afterSelection;

    onContentChange(newContent);
    addToHistory(newContent);

    // 커서를 이미지 뒤로 이동
    setTimeout(() => {
      const newCursorPos =
        start + (needsNewLineBefore ? 1 : 0) + imageMarkdown.length + (needsNewLineAfter ? 1 : 0);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // 파일 업로드 함수
  const uploadImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setIsImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderName', slug || 'default');

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드 실패');
      }

      const data = await response.json();
      const imageMarkdown = `![${file.name}](${data.url})`;

      // 디버깅 정보 출력
      console.log('이미지 업로드 성공:', {
        fileName: data.fileName,
        url: data.url,
        folderName: data.folderName,
        size: data.size,
        type: data.type,
      });

      handleImageInsert(imageMarkdown);
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imageMode === 'double') {
        uploadDoubleImageFile(file, 'first');
      } else {
        uploadImageFile(file);
      }
    }
    // input 초기화
    e.target.value = '';
  };

  const handleSecondFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadDoubleImageFile(file, 'second');
    }
    // input 초기화
    e.target.value = '';
  };

  // 더블 이미지 업로드 함수
  const uploadDoubleImageFile = async (file: File, position: 'first' | 'second') => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setIsImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderName', slug || 'default');

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('업로드 실패');
      }

      const data = await response.json();

      // 더블 이미지 데이터 업데이트
      setDoubleImageData((prev) => ({
        ...prev,
        [position]: data.url,
      }));

      // 두 이미지가 모두 업로드되면 마크다운에 삽입
      const updatedData = { ...doubleImageData, [position]: data.url };
      if (updatedData.first && updatedData.second) {
        // DoubleImage 컴포넌트를 직접 생성
        const imageMarkdown = `\n<DoubleImage 
  src1="${updatedData.first}" 
  alt1="첫 번째 이미지" 
  src2="${updatedData.second}" 
  alt2="두 번째 이미지" 
/>\n`;
        handleImageInsert(imageMarkdown);

        // 상태 초기화
        setImageMode(null);
        setDoubleImageData({});
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setIsImageUploading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        // 복사/붙여넣기 시 랜덤 이름 방지를 위해 명시적 부여
        const ext = file.type.split('/')[1] || 'png';
        const renamedFile = new File([file], `pasted-image-${Date.now()}.${ext}`, { type: file.type });
        uploadImageFile(renamedFile);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      e.preventDefault();
      uploadImageFile(imageFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    const hasFiles = e.dataTransfer.types.includes('Files');
    if (hasFiles) {
      e.preventDefault();
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      onContentChange(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      onContentChange(history[newIndex]);
    }
  };

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newContent =
      content.substring(0, start) + before + textToInsert + after + content.substring(end);
    onContentChange(newContent);
    addToHistory(newContent);

    // 커서 위치 조정
    setTimeout(() => {
      const newStart = start + before.length;
      const newEnd = newStart + textToInsert.length;
      textarea.setSelectionRange(newStart, newEnd);
      textarea.focus();
    }, 0);
  };

  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = content.substring(0, start);
    const afterCursor = content.substring(start);

    const lines = beforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];

    // 현재 라인의 시작 위치
    const lineStart = start - currentLine.length;

    const newContent = content.substring(0, lineStart) + prefix + currentLine + afterCursor;
    onContentChange(newContent);
    addToHistory(newContent);

    // 커서 위치 조정
    setTimeout(() => {
      const newCursorPos = start + prefix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // 마크다운 버튼 액션들
  const actions = {
    bold: () => insertText('**', '**', '굵은 텍스트'),
    italic: () => insertText('*', '*', '기울임 텍스트'),
    code: () => insertText('`', '`', '코드'),
    codeBlock: () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);

      // 선택된 텍스트가 있으면 코드블록으로 감싸기
      if (selectedText) {
        const newContent =
          content.substring(0, start) +
          `\n\`\`\`js\n${selectedText}\n\`\`\`\n` +
          content.substring(end);
        onContentChange(newContent);
        addToHistory(newContent);

        // 커서를 코드블록 안으로 이동
        setTimeout(() => {
          const newCursorPos = start + 8; // "\n```js\n" 길이
          textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
          textarea.focus();
        }, 0);
      } else {
        // 선택된 텍스트가 없으면 빈 코드블록 삽입
        const beforeSelection = content.substring(0, start);
        const afterSelection = content.substring(end);
        const placeholder = '// 코드를 입력하세요';

        const needsNewLineBefore = beforeSelection && !beforeSelection.endsWith('\n');
        const needsNewLineAfter = afterSelection && !afterSelection.startsWith('\n');

        const newContent =
          beforeSelection +
          (needsNewLineBefore ? '\n' : '') +
          '```js\n' +
          placeholder +
          '\n```' +
          (needsNewLineAfter ? '\n' : '') +
          afterSelection;

        onContentChange(newContent);
        addToHistory(newContent);

        // 커서를 코드 입력 위치로 이동
        setTimeout(() => {
          const prefixLength = (needsNewLineBefore ? 1 : 0) + 6; // "```js\n" 길이
          const newCursorPos = start + prefixLength;
          textarea.setSelectionRange(newCursorPos, newCursorPos + placeholder.length);
          textarea.focus();
        }, 0);
      }
    },
    h1: () => insertLinePrefix('# '),
    h2: () => insertLinePrefix('## '),
    h3: () => insertLinePrefix('### '),
    quote: () => insertLinePrefix('> '),
    unorderedList: () => insertLinePrefix('- '),
    orderedList: () => insertLinePrefix('1. '),
    link: () => insertText('[', '](url)', '링크 텍스트'),
    singleImage: () => {
      setImageMode('single');
      fileInputRef.current?.click();
    },
    doubleImage: () => {
      setImageMode('double');
      setDoubleImageData({});
      fileInputRef.current?.click();
    },
    hr: () => insertText('\n---\n', '', ''),
  };

  // 키보드 단축키
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          actions.bold();
          break;
        case 'i':
          e.preventDefault();
          actions.italic();
          break;
        case 'k':
          e.preventDefault();
          actions.link();
          break;
        case '`':
          e.preventDefault();
          if (e.shiftKey) {
            actions.codeBlock();
          } else {
            actions.code();
          }
          break;
        case 's':
          e.preventDefault();
          onSave?.();
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
      }
    }
  };

  // 마크다운을 HTML로 변환 (간단한 구현)
  const renderMarkdown = (markdown: string) => {
    return (
      markdown
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // 코드블록 처리 (```언어\n코드\n```) - 실제 블로그 스타일로 명확히 구분
        .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
          const language = lang || 'text';
          const escapedCode = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

          // 코드블록 - 더 진한 배경과 큰 패딩으로 명확히 구분
          return `<div class="not-prose my-6"><pre class="bg-gray-800 dark:bg-gray-950 text-gray-100 border border-gray-600 dark:border-gray-800 rounded-lg p-6 overflow-x-auto text-sm font-mono leading-relaxed shadow-lg"><code class="language-${language}">${escapedCode}</code></pre></div>`;
        })
        // 인라인 코드 처리 - 밝은 배경으로 구분
        .replace(
          /`(.*?)`/g,
          '<code class="bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-300 px-1.5 py-0.5 rounded text-sm font-mono border border-pink-200 dark:border-pink-800">$1</code>'
        )
        // DoubleImage 컴포넌트 처리
        .replace(
          /<DoubleImage\s+src1="([^"]*?)"\s+alt1="([^"]*?)"\s+src2="([^"]*?)"\s+alt2="([^"]*?)"\s*\/>/g,
          (match, src1, alt1, src2, alt2) => {
            const encodedSrc1 = encodeURI(src1);
            const encodedSrc2 = encodeURI(src2);

            return `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div class="space-y-2">
            <img src="${encodedSrc1}" alt="${alt1}" class="w-full h-auto rounded-lg shadow-lg object-cover" style="aspect-ratio: 16/10;" />
            ${alt1 ? `<p class="text-sm text-gray-600 dark:text-gray-400 text-center">${alt1}</p>` : ''}
          </div>
          <div class="space-y-2">
            <img src="${encodedSrc2}" alt="${alt2}" class="w-full h-auto rounded-lg shadow-lg object-cover" style="aspect-ratio: 16/10;" />
            ${alt2 ? `<p class="text-sm text-gray-600 dark:text-gray-400 text-center">${alt2}</p>` : ''}
          </div>
        </div>`;
          }
        )
        // 두 이미지 나란히 배치 처리 (연속된 두 이미지)
        .replace(/!\[(.*?)\]\((.*?)\)\s*!\[(.*?)\]\((.*?)\)/g, (match, alt1, src1, alt2, src2) => {
          const encodedSrc1 = encodeURI(src1);
          const encodedSrc2 = encodeURI(src2);

          return `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div class="space-y-2">
            <img src="${encodedSrc1}" alt="${alt1}" class="w-full h-auto rounded-lg shadow-lg object-cover" style="aspect-ratio: 16/10;" />
            ${alt1 ? `<p class="text-sm text-gray-600 dark:text-gray-400 text-center">${alt1}</p>` : ''}
          </div>
          <div class="space-y-2">
            <img src="${encodedSrc2}" alt="${alt2}" class="w-full h-auto rounded-lg shadow-lg object-cover" style="aspect-ratio: 16/10;" />
            ${alt2 ? `<p class="text-sm text-gray-600 dark:text-gray-400 text-center">${alt2}</p>` : ''}
          </div>
        </div>`;
        })
        // 단일 이미지 처리 (![alt](src))
        .replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, src) => {
          // 디버깅 정보 출력
          console.log('이미지 렌더링:', { match, alt, src });

          // URL 인코딩 처리
          const encodedSrc = encodeURI(src);
          console.log('인코딩된 URL:', encodedSrc);

          return `<div class="my-6">
          <img src="${encodedSrc}" alt="${alt}" class="w-full max-w-3xl mx-auto h-auto rounded-lg shadow-lg" />
          ${alt ? `<p class="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">${alt}</p>` : ''}
        </div>`;
        })
        // 일반 링크 처리 ([text](url))
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
        .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
        .replace(/^---$/gm, '<hr>')
        // prose 클래스가 자동으로 레이아웃을 처리하므로 적절한 단락 구분만 유지
        .replace(/\n\n+/g, '\n\n') // 연속된 줄바꿈을 두 개로 정규화
        .replace(/\n\n/g, '</p><p>') // 빈 줄을 단락 구분으로 변환
        .replace(/\n/g, ' ') // 단일 줄바꿈은 공백으로
        .replace(/^(.+)$/, '<p>$1</p>') // 전체를 p 태그로 감싸기
        // block 요소는 p 태그에서 제외
        .replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1')
        .replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/g, '$1')
        .replace(/<p>(<div.*?<\/div>)<\/p>/g, '$1')
        .replace(/<p>(<ul>.*?<\/ul>)<\/p>/g, '$1')
        .replace(/<p>(<hr>)<\/p>/g, '$1')
        .replace(/<p><\/p>/g, '')
    ); // 빈 p 태그 제거
  };

  // 버튼 공통 스타일
  const buttonStyle =
    'flex items-center justify-center w-8 h-8 rounded-md transition-all duration-200 text-slate-600 dark:text-slate-300 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div
      className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 ${className}`}
    >
      {/* 숨겨진 파일 인풋들 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={secondFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleSecondFileSelect}
        className="hidden"
      />

      {/* 도구모음 */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {/* 텍스트 서식 */}
          <div className="flex items-center space-x-1 border-r border-slate-300 pr-2 dark:border-slate-600">
            <button onClick={actions.bold} className={buttonStyle} title="굵게 (Ctrl+B)">
              <Bold className="h-4 w-4" />
            </button>
            <button onClick={actions.italic} className={buttonStyle} title="기울임 (Ctrl+I)">
              <Italic className="h-4 w-4" />
            </button>
            <button onClick={actions.code} className={buttonStyle} title="인라인 코드 (Ctrl+`)">
              <Code className="h-4 w-4" />
            </button>
            <button
              onClick={actions.codeBlock}
              className={buttonStyle}
              title="코드블록 (Ctrl+Shift+`)"
            >
              <FileCode className="h-4 w-4" />
            </button>
          </div>

          {/* 헤더 */}
          <div className="flex items-center space-x-1 border-r border-slate-300 pr-2 dark:border-slate-600">
            <button onClick={actions.h1} className={buttonStyle} title="제목 1">
              <Heading1 className="h-4 w-4" />
            </button>
            <button onClick={actions.h2} className={buttonStyle} title="제목 2">
              <Heading2 className="h-4 w-4" />
            </button>
            <button onClick={actions.h3} className={buttonStyle} title="제목 3">
              <Heading3 className="h-4 w-4" />
            </button>
          </div>

          {/* 리스트 */}
          <div className="flex items-center space-x-1 border-r border-slate-300 pr-2 dark:border-slate-600">
            <button onClick={actions.unorderedList} className={buttonStyle} title="목록">
              <List className="h-4 w-4" />
            </button>
            <button onClick={actions.orderedList} className={buttonStyle} title="번호 목록">
              <ListOrdered className="h-4 w-4" />
            </button>
            <button onClick={actions.quote} className={buttonStyle} title="인용구">
              <Quote className="h-4 w-4" />
            </button>
          </div>

          {/* 링크 및 이미지 */}
          <div className="flex items-center space-x-1 border-r border-slate-300 pr-2 dark:border-slate-600">
            <button onClick={actions.link} className={buttonStyle} title="링크 (Ctrl+K)">
              <Link className="h-4 w-4" />
            </button>
            <button
              onClick={actions.singleImage}
              disabled={isImageUploading}
              className={buttonStyle}
              title={isImageUploading ? '이미지 업로드 중...' : '단일 이미지 업로드'}
            >
              <Image className="h-4 w-4" />
            </button>
            <button
              onClick={actions.doubleImage}
              disabled={isImageUploading}
              className={buttonStyle}
              title={isImageUploading ? '이미지 업로드 중...' : '두 이미지 나란히 배치'}
            >
              <Images className="h-4 w-4" />
            </button>
            <button onClick={actions.hr} className={buttonStyle} title="구분선">
              <Minus className="h-4 w-4" />
            </button>
          </div>

          {/* 히스토리 */}
          <div className="flex items-center space-x-1 pr-2">
            <button
              onClick={undo}
              disabled={historyIndex === 0}
              className={buttonStyle}
              title="실행 취소 (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex === history.length - 1}
              className={buttonStyle}
              title="다시 실행 (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 오른쪽 액션 - 반응형으로 개선 */}
        <div className="ml-2 flex shrink-0 items-center space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center whitespace-nowrap rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
          >
            {showPreview ? (
              <EyeOff className="mr-1.5 h-4 w-4" />
            ) : (
              <Eye className="mr-1.5 h-4 w-4" />
            )}
            <span className="hidden sm:inline">{showPreview ? '편집 전용' : '분할 보기'}</span>
            <span className="sm:hidden">{showPreview ? '편집' : '분할'}</span>
          </button>
          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center whitespace-nowrap rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
            >
              <Save className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">저장</span>
              <span className="sm:hidden">저장</span>
            </button>
          )}
        </div>
      </div>

      {/* 편집기 영역 */}
      <div className="relative" style={{ height }}>
        {showPreview ? (
          /* 분할 뷰 - 편집기와 미리보기 */
          <div className="flex h-full">
            <div className="w-1/2 border-r border-slate-200 dark:border-slate-700">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="h-full w-full resize-none border-none bg-transparent p-4 font-mono text-sm leading-relaxed text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
                placeholder={placeholder}
                spellCheck={false}
              />
            </div>
            <div className="h-full w-1/2 overflow-y-auto bg-slate-50/50 dark:bg-slate-800/50">
              <div className="h-full p-4">
                <div
                  className="prose max-w-none pb-8 pt-10 dark:prose-invert
                    prose-headings:font-semibold prose-headings:tracking-tight
                    prose-a:text-primary-500 hover:prose-a:text-primary-600 prose-blockquote:border-l-4
                    prose-blockquote:border-primary-500 prose-blockquote:pl-6 prose-blockquote:italic prose-strong:font-semibold prose-em:italic prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5
                    prose-code:font-mono prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                    prose-img:rounded-lg prose-img:shadow-lg
                    prose-hr:border-gray-300 dark:hover:prose-a:text-primary-400
                    dark:prose-code:bg-gray-800 dark:prose-hr:border-gray-600"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* 편집 전용 */
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="h-full w-full resize-none border-none bg-transparent p-6 font-mono text-sm leading-relaxed text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
            placeholder={placeholder}
            spellCheck={false}
          />
        )}
      </div>

      {/* 더블 이미지 모드 알림 */}
      {imageMode === 'double' && (
        <div className="flex items-center justify-between border-t border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center space-x-3">
            <Images className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {!doubleImageData.first
                ? '첫 번째 이미지를 선택하세요'
                : !doubleImageData.second
                  ? '두 번째 이미지를 선택하세요'
                  : '두 이미지 업로드 완료!'}
            </span>
            {doubleImageData.first && !doubleImageData.second && (
              <button
                onClick={() => secondFileInputRef.current?.click()}
                className="rounded bg-blue-600 px-3 py-1 text-xs text-white transition-colors hover:bg-blue-700"
                disabled={isImageUploading}
              >
                두 번째 이미지 선택
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setImageMode(null);
              setDoubleImageData({});
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 상태바 */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <FileText className="mr-1 h-3 w-3" />
            {stats.characters} 문자
          </span>
          <span>{stats.words} 단어</span>
          <span>{stats.lines} 줄</span>
          <span>{stats.readingTime} 분 읽기</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>{showPreview ? '분할 뷰 모드' : '편집 전용 모드'}</span>
          <span>
            히스토리: {historyIndex + 1}/{history.length}
          </span>
          {isImageUploading && (
            <span className="text-blue-600 dark:text-blue-400">이미지 업로드 중...</span>
          )}
        </div>
      </div>
    </div>
  );
}
