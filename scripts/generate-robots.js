const fs = require('fs')

const generatedRobots = `
User-agent: *
Allow: /
`

fs.writeFileSync('public/robots.txt', generatedRobots, 'utf8')
