import { HomePage } from '@/app/(site)/page';
import siteMetadata from '@/data/siteMetadata';
import { genPageMetadata } from 'app/seo';

export const revalidate = false;

export const metadata = genPageMetadata({
  title: 'Welcome to Duck Blog',
  description: siteMetadata.description,
});

export default function EnHomePage() {
  return <HomePage locale="en" />;
}
