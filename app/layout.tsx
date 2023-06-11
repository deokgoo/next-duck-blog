import React from 'react'

import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Logo from '@/data/main-logo-no-bg.svg'
import Link from '@/components/Link'
import SectionContainer from '@/components/SectionContainer'
import Footer from '@/components/Footer'
import MobileNav from '@/components/MobileNav'
import ThemeSwitch from '@/components/ThemeSwitch'

import '@/css/tailwind.css'
import '@/css/prism.css'

interface Props {
  children: React.ReactNode
}

const RootLayout = ({ children }: Props) => {
  return (
    <html lang="kr" className="scroll-smooth">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="76x76"
          href="/static/favicons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/static/favicons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/static/favicons/favicon-16x16.png"
        />
        <link rel="manifest" href="/static/favicons/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/static/favicons/safari-pinned-tab.svg"
          color="#5bbad5"
        />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#000000" />
        <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.13.11/dist/katex.min.css"
          integrity="sha384-Um5gpz1odJg5Z4HAmzPtgZKdTBHZdw8S29IecapCSB31ligYPhHQZMIlWLYQGVoc"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased text-black bg-white dark:bg-gray-900 dark:text-white">
        <SectionContainer>
          <div className="flex flex-col justify-between h-screen">
            <header className="flex items-center justify-between pt-10 pb-3">
              <div>
                <Link href="/" aria-label="duck blog">
                  <div className="flex items-center justify-between">
                    <div className="mr-3" style={{ maxWidth: '192px' }}>
                      <Logo />
                    </div>
                    {typeof siteMetadata.headerTitle === 'string' ? (
                      // <div className="hidden h-6 text-2xl font-semibold sm:block">
                      <div className="hidden">{siteMetadata.headerTitle}</div>
                    ) : (
                      siteMetadata.headerTitle
                    )}
                  </div>
                </Link>
              </div>
              <div className="flex items-center text-base leading-5">
                <div className="hidden sm:block">
                  {headerNavLinks.map((link) => (
                    <Link
                      key={link.title}
                      href={link.href}
                      className="p-1 font-medium text-gray-900 sm:p-4 dark:text-gray-100"
                    >
                      {link.title}
                    </Link>
                  ))}
                </div>
                <ThemeSwitch />
                <MobileNav />
              </div>
            </header>
            <main className="mb-auto">{children}</main>
            <Footer />
          </div>
        </SectionContainer>
      </body>
    </html>
  )
}

export default RootLayout
