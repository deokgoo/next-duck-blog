import Image, { ImageProps as NextImageProps } from 'next/image';
import React from 'react';

interface ImageProps extends NextImageProps {
  align?: 'center' | 'left' | 'right';
}

const NextImage = ({ src, alt, width, height, align }: ImageProps) => {
  const styles = {
    display: 'flex',
    justifyContent: align === 'center' ? 'center' : (align === 'left' ? 'flex-start' : 'flex-end'),
  };

  return (
    <div style={styles}>
      test
    </div>
  );
};

export default NextImage;
