import { LocaleBlogCategoryPage, generateLocaleBlogCategoryParams } from '@/app/_locale/blog-category-page';
import { genPageMetadata } from 'app/seo';

export const revalidate = false;

export async function generateStaticParams() {
  return generateLocaleBlogCategoryParams('jp');
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  return genPageMetadata({ title: `${category.charAt(0).toUpperCase() + category.slice(1)} Posts (日本語)` });
}

export default async function JpBlogCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  return <LocaleBlogCategoryPage locale="jp" category={category} />;
}
