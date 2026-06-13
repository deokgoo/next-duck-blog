import {
  LocalePostPage,
  generateLocalePostParams,
  generateLocalePostMetadata,
} from '@/app/_locale/post-page';

export const revalidate = false;

export async function generateStaticParams() {
  return generateLocalePostParams('en');
}

export async function generateMetadata(props: {
  params: Promise<{ category: string; slug: string[] }>;
}) {
  const { category, slug } = await props.params;
  return generateLocalePostMetadata('en', decodeURI(category), decodeURI(slug.join('/')));
}

export default async function EnPostPage(props: {
  params: Promise<{ category: string; slug: string[] }>;
}) {
  const { category, slug } = await props.params;
  return <LocalePostPage locale="en" category={decodeURI(category)} slugParts={slug} />;
}
