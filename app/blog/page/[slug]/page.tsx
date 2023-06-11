import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import ListLayout from '@/layouts/ListLayout'
import { POSTS_PER_PAGE } from '../../../../pages/blog'
// import { PostFrontMatter } from '../../../../types/PostFrontMatter'
// import { useSearchParams } from 'next/navigation'

export const generateStaticParams = async () => {
  const totalPosts = await getAllFilesFrontMatter('blog')
  const totalPages = Math.ceil(totalPosts.length / POSTS_PER_PAGE)
  const paths = Array.from({ length: totalPages }, (_, i) => ({
    params: { page: (i + 1).toString() }
  }))

  return paths.map(({ params }) => ({ slug: params.page }))
}

const getStaticProps = async (page) => {
  const posts = await getAllFilesFrontMatter('blog')
  const pageNumber = parseInt(page as string)
  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
  const pagination = {
    currentPage: pageNumber,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE)
  }

  return {
    posts,
    initialDisplayPosts,
    pagination
  }
}

export default async function PostPage({ params }: any) {
  const { posts, initialDisplayPosts, pagination } = await getStaticProps(
    params?.slug
  )
  return (
    <>
      <PageSEO
        title={siteMetadata.title}
        description={siteMetadata.description}
      />
      <ListLayout
        posts={posts}
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        title="All Posts"
      />
    </>
  )
}
