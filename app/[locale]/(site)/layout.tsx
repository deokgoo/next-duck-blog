import { notFound } from 'next/navigation';
import SectionContainer from '@/components/SectionContainer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SUPPORTED_LOCALES = ['en', 'jp'] as const;

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleSiteLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number])) {
    notFound();
  }

  return (
    <SectionContainer>
      <div className="flex h-screen flex-col justify-between font-sans">
        <Header />
        <main className="mb-auto">{children}</main>
        <Footer />
      </div>
    </SectionContainer>
  );
}
