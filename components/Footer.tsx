import Link from './Link';
import siteMetadata from '@/data/siteMetadata';
import SocialIcon from '@/components/social-icons';
import { getAuthorBySlug } from '@/lib/firestore';

export default async function Footer() {
  const authorData = await getAuthorBySlug('default');
  
  const email = authorData?.email || siteMetadata.email;
  const github = authorData?.github || siteMetadata.github;
  const twitter = authorData?.twitter || siteMetadata.twitter;
  const linkedin = authorData?.linkedin || siteMetadata.linkedin;
  const authorName = authorData?.name || siteMetadata.author;
  const title = authorData?.blogTitle || siteMetadata.title;

  return (
    <footer>
      <div className="mt-16 flex flex-col items-center">
        <div className="mb-3 flex space-x-4">
          <SocialIcon kind="mail" href={email ? `mailto:${email}` : undefined} size={6} />
          <SocialIcon kind="github" href={github} size={6} />
          <SocialIcon kind="facebook" href={siteMetadata.facebook} size={6} />
          <SocialIcon kind="youtube" href={siteMetadata.youtube} size={6} />
          <SocialIcon kind="linkedin" href={linkedin} size={6} />
          <SocialIcon kind="twitter" href={twitter} size={6} />
          <SocialIcon kind="x" href={twitter} size={6} />
          <SocialIcon kind="instagram" href={siteMetadata.instagram} size={6} />
          <SocialIcon kind="threads" href={siteMetadata.threads} size={6} />
        </div>
        <div className="mb-2 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div>{authorName}</div>
          <div>{` • `}</div>
          <div>{`© ${new Date().getFullYear()}`}</div>
          <div>{` • `}</div>
          <Link href="/">{title}</Link>
        </div>
        <div className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          <Link href="https://github.com/timlrx/tailwind-nextjs-starter-blog">
            Tailwind Nextjs Theme
          </Link>
        </div>
      </div>
    </footer>
  );
}
