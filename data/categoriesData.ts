export const categoriesData = {
  architecture: {
    title: 'Architecture',
    description: '대규모 웹 시스템 아키텍처, Next.js + AWS 인프라, 성능 최적화 및 캐싱 전략',
    color: '#3b82f6', // blue
    icon: 'Layers',
  },
  ai: {
    title: 'AI & Agents',
    description: '36GB Mac Studio 로컬 LLM 운영, AI 에이전트 워크플로우 및 자동화 실전기',
    color: '#8b5cf6', // purple
    icon: 'Cpu',
  },
  web: {
    title: 'Web Engineering',
    description: 'React/Next.js 생태계, Web Components (Lit), HLS 스트리밍, 브라우저 인터널',
    color: '#06b6d4', // cyan
    icon: 'Terminal',
  },
  career: {
    title: 'Insight & Career',
    description: '기술 면접과 채용 기준, 기술 의사결정의 이유(Why), 8년 차 개발자 회고',
    color: '#10b981', // emerald
    icon: 'Compass',
  },
};

export type CategoryKey = keyof typeof categoriesData;
