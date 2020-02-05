import alfrid, { GL, vec3 } from 'alfrid'

import Config from './Config'
import vs from 'shaders/cards.vert'
import fs from 'shaders/cards.frag'
import fsDepth from 'shaders/depth.frag'

import { random } from 'randomutils'

const ratio = 2.5 / 3.5

class ViewCards extends alfrid.View {
  constructor () {
    super(vs, fs)
    this.shaderDepth = new alfrid.GLShader(vs, fsDepth)
  }

  _init () {
    const size = 0.5
    this.mesh = alfrid.Geom.cube(size, size / ratio, size * 0.02)
    const { vec3 } = window

    const posOffsets = []
    const axis = []
    const randoms = []
    const numCards = Config.numberOfCards
    const range = 3

    const getPos = () => {
      return [
        random(-range, range),
        random(-range, range),
        random(-range, range)
      ]
    }

    const getAxis = () => {
      const v = [
        random(-1, 1),
        random(-1, 1),
        random(-1, 1)
      ]

      vec3.normalize(v, v)
      return v
    }

    const getRandom = () => {
      return [random(1), random(1), random(1)]
    }

    for (let i = 0; i < numCards; i++) {
      posOffsets.push(getPos())
      axis.push(getAxis())
      randoms.push(getRandom())
    }

    this.mesh.bufferInstance(posOffsets, 'aPosOffset')
    this.mesh.bufferInstance(axis, 'aAxis')
    this.mesh.bufferInstance(randoms, 'aExtra')
  }

  renderShadow () {
    GL.cullFace(GL.FRONT)
    this.shaderDepth.bind()
    this.shaderDepth.uniform('uTime', 'float', alfrid.Scheduler.deltaTime * Config.speed)
    GL.draw(this.mesh)
    GL.cullFace(GL.BACK)
  }

  render (mLightPos, mShadowMatrix, mTextureDepth) {
    this.shader.bind()
    this.shader.uniform('uTime', 'float', alfrid.Scheduler.deltaTime * Config.speed)

    this.shader.uniform('uLightPos', 'vec3', mLightPos)
    this.shader.uniform('uShadowMatrix', 'mat4', mShadowMatrix)
    this.shader.uniform('textureDepth', 'uniform1i', 0)
    mTextureDepth.bind(0)

    GL.draw(this.mesh)
  }
}

export default ViewCards
