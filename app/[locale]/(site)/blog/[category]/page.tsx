import { notFound } from 'next/navigation';
import ListLayout from '@/layouts/ListLayoutWithTags';
import { allCoreContent, sortPosts } from '@/lib/types';
import { getAllPosts, getTagsByCategory, isPostPublishedAndReady } from '@/lib/firestore';
import { genPageMetadata } from 'app/seo';
import { Metadata } from 'next';

export const revalidate = false;

const SUPPORTED_LOCALES = ['en', 'jp'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_LABEL: Record<SupportedLocale, string> = {
  en: 'English',
  jp: '日本語',
};

const getValidCategories = async () => {
  const posts = await getAllPosts();
  const cats = new Set(posts.map((p) => p.category || 'dev'));
  ['dev', 'travel', 'hobby', 'life'].forEach((c) => cats.add(c));
  return Array.from(cats);
};

export async function generateMetadata(props: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata | undefined> {
  const params = await props.params;
  const locale = params.locale as SupportedLocale;
  const category = decodeURI(params.category);

  if (!SUPPORTED_LOCALES.includes(locale)) return;

  const title = `${category.charAt(0).toUpperCase() + category.slice(1)} — ${LOCALE_LABEL[locale]}`;
  return genPageMetadata({ title });
}

export async function generateStaticParams() {
  const categories = await getValidCategories();
  const params: { locale: string; category: string }[] = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const category of categories) {
      params.push({ locale, category });
    }
  }
  return params;
}

export default async function LocaleCategoryPage(props: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const params = await props.params;
  const locale = params.locale as SupportedLocale;
  const category = decodeURI(params.category);

  if (!SUPPORTED_LOCALES.includes(locale)) return notFound();

  const VALID_CATEGORIES = await getValidCategories();
  if (!VALID_CATEGORIES.includes(category)) return notFound();

  const allPosts = (await getAllPosts()).filter(isPostPublishedAndReady);

  // locale 번역이 있는 포스트만 필터링
  const localePosts = allPosts
    .filter((p) => (p.category || 'dev') === category)
    .filter((p) => !!p.translations?.[locale])
    .map((p) => ({
      ...p,
      title: p.translations![locale]!.title,
      summary: p.translations![locale]!.summary,
    }));

  const sortedPosts = sortPosts(localePosts);

  // 태그는 번역 있는 포스트 기준으로 계산
  const tagCounts: Record<string, number> = {};
  localePosts.forEach((p) => {
    p.tags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const title = `${category.charAt(0).toUpperCase() + category.slice(1)} — ${LOCALE_LABEL[locale]}`;

  return (
    <ListLayout
      posts={allCoreContent(sortedPosts)}
      title={title}
      tags={tagCounts}
    />
  );
}
