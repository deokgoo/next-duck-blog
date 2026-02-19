import NextImage, { ImageProps } from 'next/image';

const Image = ({ ...rest }: ImageProps) => {
  // If width and height are missing, and no fill, fallback to standard img
  // This handles standard markdown images ![alt](src) which don't provide dimensions
  if (!rest.width && !rest.height && !rest.fill) {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(rest as any)} />;
  }
  return <NextImage {...rest} />;
};

export default Image;
