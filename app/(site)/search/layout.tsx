import { genPageMetadata } from 'app/seo';

export const metadata = genPageMetadata({
    title: 'Search | 블로그 검색',
    description: '블로그의 모든 아티클을 키워드, 태그, 날짜별로 섬세하게 검색해보세요.',
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
