// saveImage.js

// const FILE_EXTENTION = 'jpg'
// const MIME_TYPE = 'image/jpeg'

const dataURLtoBlob = (dataurl) => {
  var arr = dataurl.split(','); var mime = arr[0].match(/:(.*?);/)[1]
  var bstr = atob(arr[1]); var n = bstr.length; var u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

const saveImage = (canvas, filename) => {
  var link = document.createElement('a')
  var imgData = canvas.toDataURL({
    format: 'png',
    multiplier: 4
  })
  // var strDataURI = imgData.substr(22, imgData.length);
  var blob = dataURLtoBlob(imgData)
  var objurl = URL.createObjectURL(blob)

  link.download = `${filename}.png`

  link.href = objurl

  link.click()
}

export { saveImage }
