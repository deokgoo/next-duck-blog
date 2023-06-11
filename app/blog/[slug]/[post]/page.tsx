import fs from 'fs'
import PageTitle from '@/components/PageTitle'
import generateRss from '@/lib/generate-rss'
import { MDXLayoutRenderer } from '@/components/MDXComponents'
import {
  formatSlug,
  getAllFilesFrontMatter,
  getFileBySlug,
  getFiles
} from '@/lib/mdx'
import { AuthorFrontMatter } from '../../../../types/AuthorFrontMatter'
import { PostFrontMatter } from '../../../../types/PostFrontMatter'
import { Toc } from '../../../../types/Toc'

const DEFAULT_LAYOUT = 'PostLayout'

export async function generateStaticParams() {
  const posts = getFiles('blog')

  return posts.map((p) => {
    const postPath = formatSlug(p).split('/')

    return {
      slug: postPath[0],
      post: postPath[1]
    }
  })
}

const getBlogDetailDataFromGraphQL = async (
  params
): Promise<{
  next: { slug: string; title: string }
  post: {
    mdxSource: string
    toc: { value: string; depth: number; url: string }[]
    frontMatter: {
      [p: string]: any
      date: string | null
      readingTime: any
      fileName: string
      slug: string | string[] | null
    }
  }
  authorDetails: Awaited<unknown>[]
  prev: { slug: string; title: string }
}> => {
  const slug = params?.slug + '/' + params?.post
  const allPosts = await getAllFilesFrontMatter('blog')
  const postIndex = allPosts.findIndex((post) => formatSlug(post.slug) === slug)
  const prev: { slug: string; title: string } = allPosts[postIndex + 1] || null
  const next: { slug: string; title: string } = allPosts[postIndex - 1] || null
  const post = await getFileBySlug<PostFrontMatter>('blog', slug)
  // @ts-ignore
  const authorList = post.frontMatter.authors || ['default']
  const authorPromise = authorList.map(async (author) => {
    const authorResults = await getFileBySlug<AuthorFrontMatter>('authors', [
      author
    ])
    return authorResults.frontMatter
  })
  const authorDetails = await Promise.all(authorPromise)

  // rss
  if (allPosts.length > 0) {
    const rss = generateRss(allPosts)
    fs.writeFileSync('./public/feed.xml', rss)
  }

  return {
    post,
    authorDetails,
    prev,
    next
  }
}

export default async function Blog({ params }) {
  const {
    prev,
    next,
    post,
    authorDetails
  } = await getBlogDetailDataFromGraphQL(params)
  const { mdxSource, toc, frontMatter } = post

  return (
    <>
      {'draft' in frontMatter && frontMatter.draft !== true ? (
        <MDXLayoutRenderer
          layout={frontMatter.layout || DEFAULT_LAYOUT}
          toc={toc}
          mdxSource={mdxSource}
          frontMatter={frontMatter}
          authorDetails={authorDetails}
          prev={prev}
          next={next}
        />
      ) : (
        <div className="mt-24 text-center">
          <PageTitle>
            Under Construction{' '}
            <span role="img" aria-label="roadwork sign">
              🚧
            </span>
          </PageTitle>
        </div>
      )}
    </>
  )
}
