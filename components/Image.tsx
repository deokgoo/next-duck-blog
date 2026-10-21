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
  // 1. w-full: 부모 컨테이너를 가득 채우지만, 커스텀 w- 클래스가 지정된 경우 생략
  // 2. object-cover: 이미지 비율을 유지하면서 컨테이너를 가득 채우도록 자름
  // 3. max-h-[400px]: MDX 콘텐츠 내에서 이미지가 너무 크게 표시되는 것을 방지 (커스텀 h- 지정 시 오버라이드 가능)
  // 4. cursor-pointer: 클릭 가능함을 나타내지만 돋보기 아이콘은 제거
  const hasCustomWidth = customClassName && /(?:^|\s)(?:w-|size-)/.test(customClassName);
  const defaultClasses = `${hasCustomWidth ? '' : 'w-full max-w-full '}max-h-[400px] object-cover cursor-pointer`;
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
