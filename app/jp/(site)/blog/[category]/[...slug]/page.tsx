import {
  LocalePostPage,
  generateLocalePostParams,
  generateLocalePostMetadata,
} from '@/app/_locale/post-page';

export const revalidate = false;

export async function generateStaticParams() {
  return generateLocalePostParams('jp');
}

export async function generateMetadata(props: {
  params: Promise<{ category: string; slug: string[] }>;
}) {
  const { category, slug } = await props.params;
  return generateLocalePostMetadata('jp', decodeURI(category), decodeURI(slug.join('/')));
}

export default async function JpPostPage(props: {
  params: Promise<{ category: string; slug: string[] }>;
}) {
  const { category, slug } = await props.params;
  return <LocalePostPage locale="jp" category={decodeURI(category)} slugParts={slug} />;
}
