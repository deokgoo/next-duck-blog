import Script from 'next/script'

import siteMetadata from '@/data/siteMetadata'

<meta name="naver-site-verification" content="3884d7b87ded12a75e3e2ba6a101a34bebcf4715" />

const NaverWebMaster = () => {
  return (
    <>
      <Script strategy="lazyOnload" src={siteMetadata.analytics.naverWebMasterId} />
    </>
  )
}

export default NaverWebMaster
