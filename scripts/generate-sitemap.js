const fs = require('fs')
const globby = require('globby')
const prettier = require('prettier')
const siteMetadata = require('../data/siteMetadata')
const axios = require('axios')

const siteUrl = 'https://duck-blog.vercel.app/sitemap.xml'

;(async () => {
  const prettierConfig = await prettier.resolveConfig('./.prettier.config.js')
  const siteData = await globby([
    'pages/*.js',
    'data/blog/algorithm/*.mdx',
    'data/blog/daily/*.mdx',
    'data/blog/nextjs/*.mdx',
    'data/blog/web/*.mdx',
    '!pages/_*.js',
    '!pages/api',
  ])
  const pages = ['/', '/blog', '/projects', '/about', ...siteData]

  const sitemap = `
        <?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${pages
              .map((page) => {
                const path = page
                  .replace('pages/', '/')
                  .replace('data/blog', '/blog')
                  .replace('public/', '/')
                  .replace('.js', '')
                  .replace('.mdx', '')
                  .replace('.md', '')
                  .replace('/feed.xml', '')
                const route = path === '/index' ? '' : path
                if (page === `pages/404.js` || page === `pages/blog/[...slug].js`) {
                  return
                }
                return `
                  <url>
                    <loc>${siteMetadata.siteUrl}${route}</loc>
                    <changefreq>${route === '/' ? 'weekly' : 'monthly'}</changefreq> 
                    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
                  </url>
                `
              })
              .join('')}
        </urlset>
    `

  const formatted = prettier.format(sitemap, {
    ...prettierConfig,
    parser: 'html',
  })

  // eslint-disable-next-line no-sync
  fs.writeFileSync('public/sitemap.xml', formatted, 'utf8')

  // await axios.get(`https://google.com/ping?sitemap=${siteUrl}`)
})()
