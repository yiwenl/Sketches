// Capture.js

import { GL } from 'alfrid'
import { saveImage } from './'

String.prototype.replaceAll = function (search, replacement) {
  var target = this
  return target.replace(new RegExp(search, 'g'), replacement)
}

const capture = () => {
  const { platform } = window.navigator
  console.log('Platform', platform)
  window.addEventListener('keydown', (e) => {
    if (platform.indexOf('Mac') > -1) {
      if (e.keyCode === 83 && e.metaKey) {
        e.preventDefault()
        const date = new Date()
        const strDate =
				`${date.getFullYear()}.` +
				`${date.getMonth() + 1}.` +
				`${date.getDate()}-` +
				`${date.getHours()}.` +
				`${date.getMinutes()}.` +
				`${date.getSeconds()}`

        saveImage(GL.canvas, strDate)
      }
    } else {
      if (e.keyCode === 83 && e.ctrlKey) {
        e.preventDefault()
        const date = new Date()
        const strDate =
					`${date.getFullYear()}.` +
					`${date.getMonth() + 1}.` +
					`${date.getDate()}-` +
					`${date.getHours()}.` +
					`${date.getMinutes()}.` +
					`${date.getSeconds()}`

        saveImage(GL.canvas, strDate)
      }
    }
  })
}

export default capture()
