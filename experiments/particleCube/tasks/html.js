// html.js

const fs = require('fs-extra')

const env = process.env.NODE_ENV
const isProd = env === 'production'

const processTemplate = (str) => new Promise((resolve, reject) => {
  if (isProd) {
    str = str.replace(/{{dev.*}}/g, '')
  } else {
    str = str.replace(/{{dev/g, '')
    str = str.replace(/}}/g, '')
  }

  resolve(str)
})

const writeTemplate = (str) => new Promise((resolve, reject) => {
  fs.writeFile('./dist/index.html', str, 'utf8')
})

fs.readFile('./src/html/index-template.html', 'utf8')
  .then(processTemplate)
  .then(writeTemplate)
  .catch(err => {
    console.log('Error :', err)
  })
