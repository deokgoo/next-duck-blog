/* eslint-disable jsx-a11y/anchor-has-content */
'use client';

import { AnchorHTMLAttributes } from 'react';

interface CustomLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
}

const CustomLink = ({ href, onClick, ...rest }: CustomLinkProps) => {
  const isInternalLink = href && href.startsWith('/');
  const isAnchorLink = href && href.startsWith('#');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    if (isInternalLink && !e.defaultPrevented) {
      e.preventDefault();
      window.location.href = href;
    }
  };

  if (isInternalLink) {
    return <a href={href} onClick={handleClick} {...rest} />;
  }

  if (isAnchorLink) {
    return <a href={href} {...rest} />;
  }

  return <a target="_blank" rel="noopener noreferrer" href={href} {...rest} />;
};

export default CustomLink;
