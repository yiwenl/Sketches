// preload.js
import debugPolyfill from '../debug/debugPolyfill'
import Capture from './Capture'
import { GL } from 'alfrid'
import assets from '../asset-list'
import Assets from '../Assets'
import AssetsLoader from 'assets-loader'

const getLoadingImage = () => new Promise((resolve, reject) => {
  const img = document.createElement('img')

  img.onload = () => {
    console.log('img loaded', img)
    resolve(img)
  }

  img.src = 'assets/css-img/loading.png'
})

const initAlfrid = () => new Promise((resolve, reject) => {
  // CREATE CANVAS
  const canvas = document.createElement('canvas')
  const container = document.body.querySelector('.container')
  canvas.className = 'Main-Canvas'
  container.appendChild(canvas)

  // INIT 3D TOOL
  GL.init(canvas, { ignoreWebgl2: false, preserveDrawingBuffer: true })

  resolve()
})

const createLoadingAnim = () => new Promise((resolve, reject) => {
  console.log('create loading animation')
  resolve()
})

const loadAssets = () => new Promise((resolve, reject) => {
  console.log('Load Assets')
  if (assets.length > 0) {
    document.body.classList.add('isLoading')

    new AssetsLoader({
      assets: assets
    })
      .on('error', (error) => {
        console.log('Error :', error)
      })
      .on('progress', (p) => {
        // console.log('Progress : ', p);
        const loader = document.body.querySelector('.Loading-Bar')
        if (loader) loader.style.width = `${(p * 100)}%`
      })
      .on('complete', (o) => {
        resolve(o)
      })
      .start()
  } else {
    resolve([])
  }
})

const initAssets = (mAssets) => new Promise((resolve, reject) => {
  console.log('Init Assets', mAssets)
  const loader = document.body.querySelector('.Loading-Bar')
  loader.style.width = '100%'

  // INIT ASSETS
  Assets.init(mAssets)

  resolve()
})

const closeLoadingAnim = () => new Promise((resolve, reject) => {
  console.log('Close loading animation')
  setTimeout(() => {
    document.body.classList.remove('isLoading')
  }, 250)

  setTimeout(() => {
    resolve()
  }, 500)
})

const preload = () => new Promise((resolve, reject) => {
  initAlfrid()
    .then(getLoadingImage)
    .then(createLoadingAnim)
    .then(loadAssets)
    .then(initAssets)
    .then(closeLoadingAnim)
    .then(() => {
      resolve()
    })
    .catch((e) => {
      console.log('Error', e)
    })
})

export default preload
