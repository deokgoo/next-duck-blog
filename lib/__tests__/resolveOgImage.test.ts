import { describe, it, expect } from 'vitest';
import { resolveOgImage } from '@/lib/resolveOgImage';

describe('resolveOgImage', () => {
  // 1) 썸네일 우선
  it('post.images[0] 을 우선으로 반환한다', () => {
    const post = {
      images: ['https://example.com/thumbnail.jpg', 'https://example.com/other.jpg'],
      content: '<p>본문</p><img src="https://example.com/content-img.jpg" />',
    };
    expect(resolveOgImage(post)).toBe('https://example.com/thumbnail.jpg');
  });

  it('post.images 가 string 배열 하나일 때도 동작한다', () => {
    const post = {
      images: ['https://example.com/thumbnail.jpg'],
      content: '<p>본문</p>',
    };
    expect(resolveOgImage(post)).toBe('https://example.com/thumbnail.jpg');
  });

  // 2) 본문 첫 이미지
  it('post.images 가 없으면 content 의 첫 번째 <img> 를 반환한다', () => {
    const post = {
      images: undefined,
      content: '<p>도입문</p><img src="https://img.example.com/first.png" alt="첫 이미지" /><p>나머지</p><img src="https://img.example.com/second.png" />',
    };
    expect(resolveOgImage(post)).toBe('https://img.example.com/first.png');
  });

  it('content 의 <img> 가 여러 개여도 첫 번째만 가져온다', () => {
    const post = {
      images: undefined,
      content: '<div class="banner"><img src="/static/images/banner-1.jpg"></div><p>중간</p><figure><img src="/static/images/figure-2.jpg"></figure>',
    };
    expect(resolveOgImage(post)).toBe('/static/images/banner-1.jpg');
  });

  it('src 속성이 "single quote" 로 묶여있는 <img> 도 찾는다', () => {
    const post = {
      images: undefined,
      content: "<img src='/og/single-quote.jpg' />",
    };
    expect(resolveOgImage(post)).toBe("/og/single-quote.jpg");
  });

  it('img src 가 attributes 중간에 와도 찾는다', () => {
    const post = {
      images: undefined,
      content: '<img class="lazy" data-src="/fallback.jpg" width="800" src="/actual-og.jpg" height="420" />',
    };
    expect(resolveOgImage(post)).toBe('/actual-og.jpg');
  });

  it('경로(relative) 형식 이미지도 그대로 반환한다', () => {
    const post = {
      images: undefined,
      content: '<img src="/og/relative.png" />',
    };
    expect(resolveOgImage(post)).toBe('/og/relative.png');
  });

  // 3) 둘 다 없으면 null
  it('images 와 content 에 이미지都没有하면 null 을 반환한다', () => {
    const post = {
      images: undefined,
      content: '<p>이미지 없는 본문</p>',
    };
    expect(resolveOgImage(post)).toBeNull();
  });

  it('images 가 빈 배열이면 content 로 fallback 한다', () => {
    const post = {
      images: [],
      content: '<img src="/body/img.jpg" />',
    };
    expect(resolveOgImage(post)).toBe('/body/img.jpg');
  });

  it('images 가 undefined, content 도 undefined 면 null', () => {
    const post = { images: undefined, content: undefined };
    expect(resolveOgImage(post)).toBeNull();
  });

  it('content 가 문자열이 아니라 null 이면 null', () => {
    const post = { images: undefined, content: null };
    expect(resolveOgImage(post)).toBeNull();
  });

  // edge cases
  it('공백 문자가 있는 <img> 도 찾는다', () => {
    const post = {
      images: undefined,
      content: '<p>   </p> <img   src   =   "  /spaced.jpg  "  />',
    };
    expect(resolveOgImage(post)).toBe("  /spaced.jpg  ");
  });

  it('Markdown 형식 ![alt](path) 는 <img> 이 아니라 찾지 않는다', () => {
    const post = {
      images: undefined,
      content: '![제목 이미지](/og/markdown-style.png)',
    };
    // HTML-only 파서: markdown 이미지 태그는 미지원
    expect(resolveOgImage(post)).toBeNull();
  });

  it('iframe/video 는 찾지 않는다 (img only)', () => {
    const post = {
      images: undefined,
      content: '<iframe src="https://youtube.com/embed/xyz"></iframe><video src="/v.mp4"></video>',
    };
    expect(resolveOgImage(post)).toBeNull();
  });
});
