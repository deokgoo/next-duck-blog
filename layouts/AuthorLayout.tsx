import { ReactNode } from 'react';
import type { Authors } from '@/lib/types';
import SocialIcon from '@/components/social-icons';
import Image from '@/components/Image';

interface Props {
  children: ReactNode;
  content: Omit<Authors, '_id' | '_raw' | 'body'>;
}

export default function AuthorLayout({ children, content }: Props) {
  const { name, avatar, occupation, company, email, twitter, linkedin, github, visibleSocials } =
    content;
  const show = (kind: string) =>
    !visibleSocials || visibleSocials.length === 0 || visibleSocials.includes(kind);

  return (
    <>
      <div className="divide-y divide-v-border dark:divide-v-border-dark">
        <div className="space-y-2 pb-xxl pt-xl md:space-y-5">
          <h1 className="text-3xl font-semibold leading-9 tracking-[-0.03em] text-ink dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            About
          </h1>
        </div>
        <div className="items-start space-y-2 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:space-y-0">
          <div className="flex flex-col items-center space-x-2 pt-xxl">
            {avatar && (
              <Image
                src={avatar}
                alt="avatar"
                width={192}
                height={192}
                className="h-48 w-48 rounded-full"
              />
            )}
            <h3 className="pb-2 pt-4 text-2xl font-semibold leading-8 tracking-[-0.02em] text-ink dark:text-gray-100">{name}</h3>
            <div className="text-ink-3 dark:text-gray-500">{occupation}</div>
            <div className="text-ink-3 dark:text-gray-500">{company}</div>
            <div className="flex space-x-3 pt-xl">
              {show('email') && <SocialIcon kind="mail" href={`mailto:${email}`} />}
              {show('github') && <SocialIcon kind="github" href={github} />}
              {show('linkedin') && <SocialIcon kind="linkedin" href={linkedin} />}
              {show('twitter') && <SocialIcon kind="x" href={twitter} />}
            </div>
          </div>
          <div className="prose max-w-none pb-xxl pt-xxl dark:prose-invert xl:col-span-2">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
