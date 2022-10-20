const path = require('path')
const express = require('express')
const app = express()


// 静态资源映射
// https://blog.csdn.net/weixin_45843676/article/details/125682723
app.use('/dist',express.static('./dist'))

// https://codeforgeek.com/render-html-file-expressjs/
app.get('/', function(req, res) {
  res.sendFile(
    path.join(__dirname, 'index.html')
  )
})

const PORT = 5000
app.listen(PORT, () => {
  const blank = ''.padStart(1)

  console.log(
    '\n',
    blank,
    '🚀🚀🚀',
    '\x1b[32m',
    'Express Server running at:\n',
    '\x1b[0m'
  )
  console.log(
    blank,
    '> Local:  ',
    '\x1b[36m',
    `http://localhost:${PORT}/`,
    '\x1b[0m'
  )
})
