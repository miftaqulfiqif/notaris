import '@testing-library/jest-dom';
import React from 'react';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { src: string | { src: string }; alt?: string }) => {
    const { src, alt, fill, priority, blurDataURL, placeholder, ...rest } = props as {
      src: string | { src: string };
      alt?: string;
      fill?: boolean;
      priority?: boolean;
      blurDataURL?: string;
      placeholder?: string;
    };
    const resolvedSrc = typeof src === 'string' ? src : src?.src || '';
    return React.createElement('img', { src: resolvedSrc, alt, ...rest });
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href, ...rest }, children),
}));
