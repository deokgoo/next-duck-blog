'use client'

import { BlogSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'

const SEOandScroll = ({ slug, authorDetails, frontMatter }: any) => {
  return (
    <>
      <BlogSEO
        url={`${siteMetadata.siteUrl}/blog/${slug}`}
        authorDetails={authorDetails}
        {...frontMatter}
      />
      <ScrollTopAndComment />
    </>
  )
}

export default SEOandScroll
