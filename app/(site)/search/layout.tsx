import { genPageMetadata } from 'app/seo';

export const metadata = genPageMetadata({
    title: 'Search | 블로그 검색',
    description: '블로그의 모든 아티클을 키워드, 태그, 날짜별로 섬세하게 검색해보세요.',
    path: '/search',
    // 검색 결과 페이지는 인덱싱하지 않는다 (검색엔진에서 중복 콘텐츠로 취급)
    robots: { index: false, follow: false },
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
