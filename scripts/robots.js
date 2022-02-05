const fs = require('fs')

const generatedRobots = `
User-agent: *
Disallow: /[MY_ADMIN_PAGE_DIR]*/
`

fs.writeFileSync('public/robots.xml', generatedRobots, 'utf8')
