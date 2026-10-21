'use client';

import NextImage, { ImageProps } from 'next/image';
import { useState, useCallback, useEffect } from 'react';

const FALLBACK_IMAGE = '/static/images/logo.png';

function ImageLightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-3xl text-white hover:text-gray-300"
        aria-label="닫기"
      >
        ✕
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] rounded object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

interface ImageComponentProps extends ImageProps {
  /** figure/figcaption 래퍼를 생략 (썸네일 등 레이아웃 제어용) */
  bare?: boolean;
}

const Image = ({ alt, src, bare, ...rest }: ImageComponentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // 깨진 이미지(404 등) 감지 → 폴백 로고로 대체
  const [failed, setFailed] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // src가 바뀌면 폴백 상태 초기화
  useEffect(() => {
    setFailed(false);
    setCurrentSrc(src);
  }, [src]);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleError = useCallback(() => {
    if (currentSrc !== FALLBACK_IMAGE) {
      setFailed(true);
      setCurrentSrc(FALLBACK_IMAGE);
    }
  }, [currentSrc]);

  // src가 undefined, null, 또는 빈 문자열인 경우 즉시 폴백 이미지 사용
  const isSrcValid = src && typeof src === 'string' && src.trim() !== '';
  const resolvedSrc = !isSrcValid || failed ? FALLBACK_IMAGE : currentSrc;

  // src가 유효하지 않거나 실패한 경우, NextImage 대신 <img> 태그를 사용하여 폴백 이미지 렌더링
  // NextImage는 src가 undefined일 때 렌더링하지 않거나 에러를 던질 수 있으므로
  const shouldUseFallbackImg = !isSrcValid || failed;

  const imgElement = shouldUseFallbackImg ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      src={FALLBACK_IMAGE}
      {...(rest as any)}
      className="cursor-zoom-in"
      onClick={handleOpen}
    />
  ) : !rest.width && !rest.height && !rest.fill ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      src={resolvedSrc as string}
      {...(rest as any)}
      className="cursor-zoom-in"
      onClick={handleOpen}
      onError={handleError}
    />
  ) : (
    <NextImage
      alt={alt}
      src={resolvedSrc}
      {...rest}
      className="cursor-zoom-in"
      onClick={handleOpen}
      onError={handleError}
    />
  );

  return (
    <>
      {bare ? (
        imgElement
      ) : alt ? (
        <figure className="my-4 flex flex-col items-center">
          {imgElement}
          <figcaption className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            {alt}
          </figcaption>
        </figure>
      ) : (
        imgElement
      )}
      {isOpen && (
        <ImageLightbox src={src as string} alt={alt || ''} onClose={handleClose} />
      )}
    </>
  );
};

export default Image;
