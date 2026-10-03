interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
  icon?: string
  stack?: string[]
}

const projectsData: Project[] = [
  {
    title: 'next-duck-blog',
    description:
      'MDX + Firestore 기반 개인 블로그. Vercel 자동 배포, 다국어(i18n), 자동 OG 이미지 생성.',
    href: 'https://github.com/next-duck-blog',
    icon: '🦆',
    stack: ['Next.js', 'TypeScript', 'Firebase'],
  },
  {
    title: '2026 Osaka Trip',
    description:
      '여행 저널 PWA. 지도 기반 일정, 사진 타임라인, 오프라인 모드 지원.',
    href: 'https://github.com/2026osaka',
    icon: '🗓️',
    stack: ['PWA', 'Mapbox', 'IndexedDB'],
  },
  {
    title: 'MLX Local LLM',
    description:
      'Mac에서 돌아가는 OpenAI 호환 로컬 LLM 서버. Hermes Agent에 연동.',
    icon: '⚡',
    stack: ['MLX', 'Python', 'OpenAI API'],
  },
]

export default projectsData
