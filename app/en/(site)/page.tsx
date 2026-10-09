import { HomePage, homeMetadata } from '@/app/(site)/page';
import siteMetadata from '@/data/siteMetadata';

export const revalidate = false;

export const metadata = homeMetadata({
  path: '/en',
  title: 'Welcome to Duck Blog',
  description: siteMetadata.description,
  locale: 'en_US',
});

export default function EnHomePage() {
  return <HomePage locale="en" />;
}
