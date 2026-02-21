import siteMetadata from '@/data/siteMetadata';
import Logo from '@/data/logo.png';
import Link from './Link';
import MobileNav from './MobileNav';
import ThemeSwitch from './ThemeSwitch';
import SearchButton from './SearchButton';
import NavLinks from './NavLinks';
import Image from 'next/image';
import { getAuthorBySlug } from '@/lib/firestore';

const Header = async () => {
  const authorData = await getAuthorBySlug('default');
  const headerTitle = authorData?.blogTitle || siteMetadata.headerTitle;
  const siteLogo = authorData?.siteLogo || Logo;

  return (
    <header className="flex items-center justify-between py-10">
      <div>
        <Link href="/" aria-label={typeof headerTitle === 'string' ? headerTitle : 'Blog'}>
          <div className="flex items-center justify-between">
            <div className="mr-3">
              {typeof siteLogo === 'string' ? (
                <img src={siteLogo} alt="Logo" className="h-8 w-auto object-contain" />
              ) : (
                <Image src={siteLogo} alt="Logo" width={32} height={32} className="h-8 w-auto object-contain" />
              )}
            </div>
            {typeof headerTitle === 'string' ? (
              <div className="h-6 text-2xl font-semibold sm:block">{headerTitle}</div>
            ) : (
              headerTitle
            )}
          </div>
        </Link>
      </div>
      <div className="flex items-center space-x-4 leading-5 sm:space-x-6">
        <NavLinks />
        <SearchButton />
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  );
};

export default Header;
