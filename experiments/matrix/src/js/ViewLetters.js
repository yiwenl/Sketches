import alfrid, { GL } from 'alfrid'

import Assets from './Assets'
import Config from './Config'
import { randomFloor, random } from 'randomutils'

import vs from 'shaders/letters.vert'
import fs from 'shaders/letters.frag'

class ViewLetters extends alfrid.View {
  constructor () {
    super(vs, fs)
  }

  _init () {
    this.texture = Assets.get('chars')
    this.texture.minFilter = this.texture.magFilter = GL.LINEAR

    const positions = []
    const uvs = []
    const indices = []
    const normals = []
    const numChars = 100
    let count = 0
    const s = 0.05

    for (let i = 0; i < numChars; i++) {
      const ty = i * s - numChars / 2 * s
      const r = randomFloor(64)
      const r1 = Math.random()
      positions.push([-s / 2, -s / 2, ty])
      positions.push([s / 2, -s / 2, ty])
      positions.push([s / 2, s / 2, ty])
      positions.push([-s / 2, s / 2, ty])

      uvs.push([0, 0])
      uvs.push([1, 0])
      uvs.push([1, 1])
      uvs.push([0, 1])

      normals.push([1.0 - i / numChars, r, r1])
      normals.push([1.0 - i / numChars, r, r1])
      normals.push([1.0 - i / numChars, r, r1])
      normals.push([1.0 - i / numChars, r, r1])

      indices.push(count * 4 + 0)
      indices.push(count * 4 + 1)
      indices.push(count * 4 + 2)
      indices.push(count * 4 + 0)
      indices.push(count * 4 + 2)
      indices.push(count * 4 + 3)

      count++
    }

    const posOffsets = []
    const extras = []
    const num = 1500

    console.log(num * numChars)
    const r = 3.5
    const rz = 0.1
    for (let i = 0; i < num; i++) {
      posOffsets.push([
        random(-r, r),
        random(-1, 1),
        random(-rz, rz)
      ])

      extras.push([random(1), random(1), random(1)])
    }

    this.mesh = new alfrid.Mesh()
    this.mesh.bufferVertex(positions)
    this.mesh.bufferNormal(normals)
    this.mesh.bufferTexCoord(uvs)
    this.mesh.bufferIndex(indices)

    this.mesh.bufferInstance(posOffsets, 'aPosOffset')
    this.mesh.bufferInstance(extras, 'aExtra')
  }

  render (textureDepth, mShadowMatrix) {
    this.shader.bind()
    this.shader.uniform('uUseGreen', 'float', Config.useGreen)
    this.shader.uniform('uTime', 'float', alfrid.Scheduler.deltaTime)
    this.shader.uniform('uShadowMatrix', 'mat4', mShadowMatrix)
    this.shader.uniform('uIsInvert', 'float', Config.isInvert ? 1.0 : 0.0)
    this.shader.uniform('texture', 'uniform1i', 0)
    this.texture.bind(0)

    this.shader.uniform('textureDepth', 'uniform1i', 1)
    textureDepth.bind(1)

    GL.draw(this.mesh)
  }
}

export default ViewLetters
