import { LocaleCategoryLandingPage } from '@/app/_locale/category-landing-page';
import { categoriesData } from '@/data/categoriesData';
import siteMetadata from '@/data/siteMetadata';

export const revalidate = false;

export async function generateStaticParams() {
  return Object.keys(categoriesData).map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const data = categoriesData[category as keyof typeof categoriesData];
  if (!data) return;
  return {
    title: `${data.title} (日本語) | ${siteMetadata.title}`,
    description: data.description,
  };
}

export default async function JpCategoryLandingPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return <LocaleCategoryLandingPage locale="jp" category={category} />;
}
