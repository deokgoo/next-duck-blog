import Head from 'next/head'
import siteMetadata from '@/data/siteMetadata'

const NaverWebMaster = () => {
  return (
    <Head>
      <meta name="naver-site-verification" content={siteMetadata.analytics.naverWebMasterId} />
    </Head>
  )
}

export default NaverWebMaster
