'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Link, X, Loader, AlertCircle, ImageIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

export interface BannerImageSettingProps {
  imageUrl: string;
  slug: string;
  isPostBanner: boolean;
  onImageChange: (url: string) => void;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export default function BannerImageSetting({
  imageUrl,
  slug,
  isPostBanner,
  onImageChange,
}: BannerImageSettingProps) {
  const { user } = useAuth();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 오류 메시지 5초 후 자동 제거
  const showError = useCallback((message: string) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorMessage(message);
    setUploadStatus('error');
    errorTimerRef.current = setTimeout(() => {
      setErrorMessage('');
      setUploadStatus('idle');
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  // 이미지 URL 변경 시 로드 에러 상태 초기화
  useEffect(() => {
    setImageLoadError(false);
  }, [imageUrl]);

  // 클라이언트 측 파일 검증
  const validateFile = useCallback(
    (file: File): boolean => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        showError('지원하지 않는 파일 형식입니다. JPG, PNG, GIF, WebP만 가능합니다.');
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        showError('파일 크기가 5MB를 초과합니다.');
        return false;
      }
      return true;
    },
    [showError]
  );

  // 파일 업로드
  const uploadFile = useCallback(
    async (file: File) => {
      if (!validateFile(file)) return;

      setUploadStatus('uploading');
      setErrorMessage('');

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folderName', slug);

        const token = await user?.getIdToken();
        const response = await fetch('/api/images/upload', {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '업로드 실패');
        }

        const result = await response.json();
        setUploadStatus('success');
        onImageChange(result.url);

        setTimeout(() => setUploadStatus('idle'), 3000);
      } catch (error) {
        showError(error instanceof Error ? error.message : '업로드 실패');
      }
    },
    [slug, user, onImageChange, validateFile, showError]
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
      const imageFile = files.find((f) => f.type.startsWith('image/'));

      if (!imageFile) {
        showError('이미지 파일만 업로드 가능합니다.');
        return;
      }

      uploadFile(imageFile);
    },
    [uploadFile, showError]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      e.target.value = '';
    },
    [uploadFile]
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // URL 직접 입력
  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageChange(urlInput.trim());
      setUrlInput('');
    }
  };

  const isUploading = uploadStatus === 'uploading';

  return (
    <div
      className={`space-y-3 rounded-lg border p-3 transition-all ${
        isPostBanner
          ? 'border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/30'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        배너 이미지
      </label>

      {/* 썸네일 미리보기 */}
      {imageUrl && (
        <div className="relative">
          {imageLoadError ? (
            <div className="flex h-32 w-full items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          ) : (
            <img
              src={imageUrl}
              alt="배너 미리보기"
              className="h-32 w-full rounded-md object-cover"
              onError={() => setImageLoadError(true)}
            />
          )}
          <button
            type="button"
            onClick={() => onImageChange('')}
            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
            title="배너 이미지 삭제"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 업로드 영역 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
        onKeyDown={(e) => e.key === 'Enter' && handleUploadClick()}
        role="button"
        tabIndex={0}
        className={`relative cursor-pointer rounded-md border-2 border-dashed p-4 text-center transition-all ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 hover:border-blue-400 dark:border-gray-600 dark:hover:border-blue-500'
        } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-2">
            <Loader className="mx-auto h-6 w-6 animate-spin text-blue-600" />
            <p className="text-xs text-gray-600 dark:text-gray-400">업로드 중...</p>
          </div>
        ) : (
          <div className="space-y-1">
            <Upload className="mx-auto h-6 w-6 text-gray-400" />
            <p className="text-xs text-gray-600 dark:text-gray-400">클릭 또는 드래그하여 업로드</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              JPG, PNG, GIF, WebP (최대 5MB)
            </p>
          </div>
        )}
      </div>

      {/* URL 직접 입력 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            placeholder="이미지 URL 직접 입력"
            disabled={isUploading}
            className="w-full rounded-md border border-gray-300 py-1.5 pl-7 pr-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          type="button"
          onClick={handleUrlSubmit}
          disabled={!urlInput.trim() || isUploading}
          className="rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white transition-colors hover:bg-black disabled:opacity-40 dark:bg-gray-100 dark:text-black dark:hover:bg-white"
        >
          설정
        </button>
      </div>

      {/* 오류 메시지 */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 rounded-md bg-red-100 p-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
