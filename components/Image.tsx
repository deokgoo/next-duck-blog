'use client';

import NextImage, { ImageProps } from 'next/image';
import { useState, useCallback, useEffect } from 'react';

const FALLBACK_IMAGE = '/static/images/logo.png';

interface ImageComponentProps extends ImageProps {
  /** figure/figcaption 래퍼를 생략 (썸네일 등 레이아웃 제어용) */
  bare?: boolean;
}

const Image = ({ alt, src, bare = true, ...rest }: ImageComponentProps) => {
  // 클릭 시 확대 보기(Lightbox) 기능을 제거했으므로 isOpen 상태는 더 이상 필요 없음
  // const [isOpen, setIsOpen] = useState(false);
  
  // 깨진 이미지(404 등) 감지 → 폴백 로고로 대체
  const [failed, setFailed] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // src가 바뀌면 폴백 상태 초기화
  useEffect(() => {
    setFailed(false);
    setCurrentSrc(src);
  }, [src]);

  // const handleOpen = useCallback(() => setIsOpen(true), []);
  // const handleClose = useCallback(() => setIsOpen(false), []);

  const handleError = useCallback(() => {
    // 이미 폴백 이미지인 경우 제외하고, 에러 발생 시 폴백 이미지로 전환
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

  const { className: customClassName, ...otherProps } = rest;

  // 공통 클래스: 
  // 1. w-auto max-w-full h-auto: 원본 가로세로 비율 유지 (커스텀 w- 지정 시 생략)
  // 2. object-contain: 이미지가 잘리지 않고 전체가 선명하게 표시되도록 설정 (커스텀 object- 지정 시 오버라이드)
  // 3. max-h-[700px]: 너무 긴 이미지가 화면을 지나치게 차지하지 않도록 높이 상한선 지정 (커스텀 max-h- 지정 시 오버라이드)
  // 4. mx-auto block: 가운데 정렬
  const hasCustomWidth = customClassName && /(?:^|\s)(?:w-|size-)/.test(customClassName);
  const hasCustomFit = customClassName && /(?:^|\s)object-/.test(customClassName);
  const hasCustomMaxHeight = customClassName && /(?:^|\s)max-h-/.test(customClassName);

  const defaultClasses = [
    hasCustomWidth ? '' : 'w-auto max-w-full',
    'h-auto',
    hasCustomMaxHeight ? '' : 'max-h-[700px]',
    hasCustomFit ? '' : 'object-contain',
    'mx-auto block cursor-pointer',
  ].filter(Boolean).join(' ');

  const finalClasses = customClassName ? `${defaultClasses} ${customClassName}`.trim() : defaultClasses;

  const imgElement = shouldUseFallbackImg ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      src={FALLBACK_IMAGE}
      {...(otherProps as any)}
      className={finalClasses}
      // onClick={handleOpen} // 클릭 시 확대 기능 제거
    />
  ) : !rest.width && !rest.height && !rest.fill ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      src={resolvedSrc as string}
      {...(otherProps as any)}
      className={finalClasses}
      onError={handleError}
      // onClick={handleOpen} // 클릭 시 확대 기능 제거
    />
  ) : (
    <NextImage
      alt={alt}
      src={resolvedSrc}
      {...otherProps}
      className={finalClasses}
      onError={handleError}
      // onClick={handleOpen} // 클릭 시 확대 기능 제거
    />
  );

  return (
    <>
      {bare ? (
        imgElement
      ) : alt ? (
        // <figure> 대신 <div>를 사용하여 <p> 태그 안에서의 중첩 오류 방지
        <div className="my-4 flex flex-col items-center">
          {imgElement}
          <figcaption className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            {alt}
          </figcaption>
        </div>
      ) : (
        imgElement
      )}
      {/* Lightbox 렌더링 제거 */}
      {/* {isOpen && (
        <ImageLightbox src={src as string} alt={alt || ''} onClose={handleClose} />
      )} */}
    </>
  );
};

export default Image;
