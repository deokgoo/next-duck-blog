import SectionContainer from '@/components/SectionContainer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
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
