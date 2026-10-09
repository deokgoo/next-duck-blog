import { HomePage, homeMetadata } from '@/app/(site)/page';
import siteMetadata from '@/data/siteMetadata';

export const revalidate = false;

export const metadata = homeMetadata({
  path: '/jp',
  title: 'Duck Blog へようこそ',
  description: siteMetadata.description,
  locale: 'ja_JP',
});

export default function JpHomePage() {
  return <HomePage locale="jp" />;
}
