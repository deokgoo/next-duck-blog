'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Lightbox Modal Component
const Lightbox: React.FC<{ src: string; alt: string; onClose: () => void }> = ({
  src,
  alt,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    setMounted(true);
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative h-auto max-h-[90vh] w-auto max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
        />
        <button
          className="absolute -right-2 -top-10 text-2xl text-white transition-colors hover:text-gray-300"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          &times;
        </button>
      </div>
    </div>,
    document.body
  );
};

// Custom Image Component with Lightbox
export default function LightboxImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const { src, alt, className, ...rest } = props;

  if (!src) return null;

  const handleClick = () => {
    setIsLightboxOpen(true);
  };

  const defaultClasses =
    'cursor-zoom-in rounded-lg max-h-[450px] w-full max-w-full object-cover transition-transform duration-200 hover:scale-[1.01] hover:shadow-lg';
  const finalClasses = className ? `${defaultClasses} ${className}` : defaultClasses;

  return (
    <>
      <img
        {...rest}
        src={src}
        alt={alt}
        className={finalClasses}
        onClick={handleClick}
      />
      {isLightboxOpen && (
        <Lightbox src={src} alt={alt || ''} onClose={() => setIsLightboxOpen(false)} />
      )}
    </>
  );
}
