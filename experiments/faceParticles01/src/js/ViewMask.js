import alfrid, { GL } from 'alfrid'

import * as faceapi from 'face-api.js'

import Assets from './Assets'
import Config from './Config'
import vs from 'shaders/mask.vert'
import fs from 'shaders/mask.frag'

const MODEL_URL = '/weights'

class ViewMask extends alfrid.View {
  constructor () {
    super(vs, fs)
  }

  _init () {
    this.mesh = Assets.get('mask')

    console.log('faceapi', faceapi)
    this.startFaceDetection()
  }

  async startFaceDetection () {
    await faceapi.loadFaceLandmarkModel('/weights')
    console.log('model loaded')
  }

  render () {
    this.shader.bind()
    this.shader.uniform('uPosition', 'vec3', [0, 0, 2])
    this.shader.uniform('uScale', 'float', 1.0 * Config.maskScale)
    GL.draw(this.mesh)
  }
}

export default ViewMask
