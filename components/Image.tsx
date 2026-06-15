'use client';

import NextImage, { ImageProps } from 'next/image';
import { useState, useCallback } from 'react';

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

const Image = ({ alt, src, ...rest }: ImageProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  const imgElement =
    !rest.width && !rest.height && !rest.fill ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt}
        src={src as string}
        {...(rest as any)}
        className="cursor-zoom-in"
        onClick={handleOpen}
      />
    ) : (
      <NextImage
        alt={alt}
        src={src}
        {...rest}
        className="cursor-zoom-in"
        onClick={handleOpen}
      />
    );

  return (
    <>
      {alt ? (
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
