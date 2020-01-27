import alfrid, { GL } from 'alfrid'

// import * as faceapi from 'face-api.js'

import Assets from './Assets'
import Config from './Config'
import vs from 'shaders/mask.vert'
import fs from 'shaders/mask.frag'

const MODEL_URL = '/weights'
const SSD_MOBILENETV1 = 'ssd_mobilenetv1'
const TINY_FACE_DETECTOR = 'tiny_face_detector'
const inputSize = 224
const scoreThreshold = 0.5

function getCurrentFaceDetectionNet () {
  return faceapi.nets.tinyFaceDetector
}

function isFaceDetectionModelLoaded () {
  return !!getCurrentFaceDetectionNet().params
}

class ViewMask extends alfrid.View {
  constructor () {
    super(vs, fs)
  }

  _init () {
    this.mesh = Assets.get('mask')

    console.log('faceapi', faceapi)

    this._initWebcam()
    this.startFaceDetection()
  }

  async _initWebcam () {
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
    this._videoEl = document.querySelector('.webcamVideo')
    this._videoEl.srcObject = stream
    console.log('init webcam')
  }

  async startFaceDetection () {
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
    await faceapi.loadFaceLandmarkModel(MODEL_URL)
    this._facedetectionOption = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })

    this.getFace()
  }

  async getFace () {
    const videoEl = document.querySelector('.webcamVideo')

    if (videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded()) {
      return setTimeout(() => this.getFace())
    }

    const result = await faceapi.detectSingleFace(this._videoEl, this._facedetectionOption).withFaceLandmarks()
    if (result) {
      const { positions, relativePositions } = result.landmarks
      if (Math.random() > 0.9) {
        console.log('result:', result.landmarks.getNose())
        console.log('result:', result.landmarks.getRefPointsForAlignment())
      }
    }

    setTimeout(() => this.getFace())
  }

  render () {
    this.shader.bind()
    this.shader.uniform('uPosition', 'vec3', [0, 0, 2])
    this.shader.uniform('uScale', 'float', 1.0 * Config.maskScale)
    GL.draw(this.mesh)
  }
}

export default ViewMask
