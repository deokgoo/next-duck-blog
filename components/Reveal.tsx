'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  /** 스태거 지연(ms) — 같은 그룹에서 순차 등장 */
  delay?: number;
  /** 이동 거리(px) */
  y?: number;
  className?: string;
};

/**
 * 스크롤 리빌: 뷰포트에 진입하면 부드럽게 페이드인 + 위로.
 * - IntersectionObserver 기반, 한 번만 트리거
 * - prefers-reduced-motion이면 즉시 표시 (접근성)
 * - SSR 안전: 마운트 전엔 opacity-0, 마운트 후 observer가 처리
 */
export default function Reveal({ children, delay = 0, y = 18, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 모션 최소화 설정이면 애니메이션 없이 표시
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
        shown ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      style={{
        transform: shown ? 'translateY(0)' : `translateY(${y}px)`,
        transitionDelay: shown ? `${delay}ms` : '0ms',
      }}
    >
      {children}
    </div>
  );
}
