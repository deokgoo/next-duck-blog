const prettierConfig = require('prettier-config-standard')
module.exports = {
  ...prettierConfig,
  // mdx 파일에 대한 설정을 추가합니다.
  overrides: [
    {
      files: ['*.mdx'],
      options: {
        parser: 'mdx',
        printWidth: '80'
        // 필요한 설정을 추가합니다.
      }
    }
  ]
}
