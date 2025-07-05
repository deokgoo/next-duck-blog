'use client';

import { useState, useRef, useEffect } from 'react';
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
  Save,
  Hash,
  Plus,
  X,
  FileText,
  Settings,
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
}

export default function WysiwygEditor({
  initialContent = '',
  initialMetadata,
  onSave,
  onPreview,
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
  const [showMetadata, setShowMetadata] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [lastModified, setLastModified] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 클라이언트에서만 날짜 설정
  useEffect(() => {
    setLastModified(
      new Date().toLocaleDateString('ko-KR') + ' ' + new Date().toLocaleTimeString('ko-KR')
    );
  }, []);

  // 텍스트 선택 감지
  const handleTextSelect = () => {
    // 필요시 텍스트 선택 로직 추가
  };

  // 텍스트 삽입 함수
  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = content.substring(start, end);

    const newText = before + selectedText + after;
    const newContent = content.substring(0, start) + newText + content.substring(end);

    setContent(newContent);

    // 커서 위치 설정
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

    // 실제로는 서버에 업로드하고 URL을 받아야 함
    // 여기서는 데모용으로 로컬 URL 생성
    const imageUrl = URL.createObjectURL(file);
    const imageMarkdown = `![${file.name}](${imageUrl})\n`;
    insertText(imageMarkdown);
  };

  // 태그 추가
  const addTag = () => {
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      setMetadata((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  // 태그 제거
  const removeTag = (tagToRemove: string) => {
    setMetadata((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // 메타데이터를 frontmatter로 변환
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

  // 전체 MDX 생성
  const generateMDX = () => {
    return generateFrontmatter() + content;
  };

  // 저장
  const handleSave = () => {
    const fullContent = generateMDX();
    onSave?.(fullContent, metadata);
  };

  // 미리보기
  const handlePreview = () => {
    const fullContent = generateMDX();
    onPreview?.(fullContent);
    setIsPreviewMode(!isPreviewMode);
  };

  return (
    <div className="mx-auto max-w-6xl rounded-lg bg-white p-4 shadow-lg dark:bg-gray-900">
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between border-b pb-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">MDX 에디터</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowMetadata(!showMetadata)}
            className="rounded-md bg-gray-100 px-3 py-2 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <Settings className="h-4 w-4" />
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
              title="굵게"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertText('*', '*')}
              className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="기울임"
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
              title="헤더 1"
            >
              <Heading1 className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertAtLineStart('## ')}
              className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="헤더 2"
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertAtLineStart('### ')}
              className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="헤더 3"
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
              title="링크"
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
      <div className="grid grid-cols-1 gap-4">
        {!isPreviewMode ? (
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onSelect={handleTextSelect}
              className="h-96 w-full resize-none rounded-lg border border-gray-300 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder="여기에 MDX 내용을 작성하세요...&#10;&#10;예시:&#10;# 제목&#10;&#10;내용을 작성하세요.&#10;&#10;```javascript&#10;const example = 'code';&#10;```"
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
              {content.length} 글자
            </div>
          </div>
        ) : (
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
        <div>
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
        <div>{lastModified && `마지막 수정: ${lastModified}`}</div>
      </div>
    </div>
  );
}
