import { HomePage } from '@/app/(site)/page';
import siteMetadata from '@/data/siteMetadata';
import { genPageMetadata } from 'app/seo';

export const revalidate = false;

export const metadata = genPageMetadata({
  title: 'Duck Blog へようこそ',
  description: siteMetadata.description,
});

export default function JpHomePage() {
  return <HomePage locale="jp" />;
}
