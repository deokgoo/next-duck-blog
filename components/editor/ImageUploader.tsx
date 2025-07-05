'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Image, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface ImageUploaderProps {
  slug?: string;
  onImageInsert?: (imageMarkdown: string) => void;
  className?: string;
}

interface UploadState {
  status: 'idle' | 'uploading' | 'success' | 'error';
  progress: number;
  message: string;
}

export default function ImageUploader({
  slug = '',
  onImageInsert,
  className = '',
}: ImageUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: 'idle',
    progress: 0,
    message: '',
  });

  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<
    Array<{
      url: string;
      fileName: string;
      alt: string;
    }>
  >([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 업로드 함수
  const uploadFile = useCallback(
    async (file: File) => {
      if (!file) return;

      setUploadState({
        status: 'uploading',
        progress: 0,
        message: '이미지 업로드 중...',
      });

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('slug', slug);

        const response = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '업로드 실패');
        }

        const result = await response.json();

        setUploadState({
          status: 'success',
          progress: 100,
          message: '업로드 완료!',
        });

        // 업로드된 이미지 정보 저장
        const altText = file.name.split('.')[0];
        const newImage = {
          url: result.url,
          fileName: result.fileName,
          alt: altText,
        };

        setUploadedImages((prev) => [...prev, newImage]);

        // 마크다운 형태로 에디터에 삽입
        const imageMarkdown = `![${altText}](${result.url})`;
        onImageInsert?.(imageMarkdown);

        // 3초 후 상태 초기화
        setTimeout(() => {
          setUploadState({
            status: 'idle',
            progress: 0,
            message: '',
          });
        }, 3000);
      } catch (error) {
        setUploadState({
          status: 'error',
          progress: 0,
          message: error instanceof Error ? error.message : '업로드 실패',
        });

        // 5초 후 상태 초기화
        setTimeout(() => {
          setUploadState({
            status: 'idle',
            progress: 0,
            message: '',
          });
        }, 5000);
      }
    },
    [slug, onImageInsert]
  );

  // 드래그앤드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));

      if (imageFiles.length === 0) {
        setUploadState({
          status: 'error',
          progress: 0,
          message: '이미지 파일만 업로드 가능합니다.',
        });
        return;
      }

      // 첫 번째 이미지만 업로드
      uploadFile(imageFiles[0]);
    },
    [uploadFile]
  );

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
      // input 초기화
      e.target.value = '';
    },
    [uploadFile]
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 업로드 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
        onKeyDown={(e) => e.key === 'Enter' && handleUploadClick()}
        role="button"
        tabIndex={0}
        className={`
          relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all
          ${
            isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-500'
          }
          ${uploadState.status === 'uploading' ? 'pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploadState.status === 'uploading' ? (
          <div className="space-y-3">
            <Loader className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400">{uploadState.message}</p>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">이미지 업로드</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                클릭하거나 드래그해서 이미지를 업로드하세요
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                지원 형식: JPG, PNG, GIF, WebP (최대 5MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 상태 메시지 */}
      {uploadState.message && uploadState.status !== 'uploading' && (
        <div
          className={`flex items-center space-x-2 rounded-md p-3 text-sm ${
            uploadState.status === 'success'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
          }`}
        >
          {uploadState.status === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{uploadState.message}</span>
        </div>
      )}

      {/* 업로드된 이미지 목록 */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">업로드된 이미지</h4>
          <div className="space-y-2">
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 rounded-md bg-gray-50 p-2 dark:bg-gray-700"
              >
                <Image className="h-4 w-4 text-gray-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {image.fileName}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{image.url}</p>
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
                  title="제거"
                >
                  <X className="h-3 w-3 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 사용 가이드 */}
      <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
        <h4 className="mb-1 text-sm font-medium text-blue-800 dark:text-blue-200">
          💡 이미지 업로드 가이드
        </h4>
        <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
          <li>
            • 이미지는 자동으로 <code>/static/images/{slug || 'general'}/</code> 폴더에 저장됩니다
          </li>
          <li>• 업로드 즉시 마크다운 형태로 에디터에 삽입됩니다</li>
          <li>• 파일명은 타임스탬프가 추가되어 중복을 방지합니다</li>
          <li>• 한글 제목은 자동으로 영어 폴더명으로 변환됩니다</li>
        </ul>
      </div>
    </div>
  );
}
