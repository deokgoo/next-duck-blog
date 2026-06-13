import { LocaleBlogCategoryPage, generateLocaleBlogCategoryParams } from '@/app/_locale/blog-category-page';
import { genPageMetadata } from 'app/seo';

export const revalidate = false;

export async function generateStaticParams() {
  return generateLocaleBlogCategoryParams('en');
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  return genPageMetadata({ title: `${category.charAt(0).toUpperCase() + category.slice(1)} Posts (English)` });
}

export default async function EnBlogCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return <LocaleBlogCategoryPage locale="en" category={category} />;
}
