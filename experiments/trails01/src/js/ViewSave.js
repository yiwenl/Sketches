// ViewSave.js

import alfrid, { GL } from 'alfrid'
import vs from 'shaders/save.vert'
import fs from 'shaders/save.frag'
import Config from './Config'
import { random, randomGaussian } from 'randomutils'

class ViewSave extends alfrid.View {
  constructor (mRatio) {
    super(vs, fs)
    this._ratio = mRatio
    this._initMesh()
  }

  _initMesh () {
    const positions = []
    const coords = []
    const indices = []
    const extras = []
    const mapUV = []
    let count = 0

    const numParticles = Config.numParticles
    const totalParticles = numParticles * numParticles
    console.debug('Total Particles : ', totalParticles)
    let ux, uy
    const { planeSize } = Config
    const w = planeSize
    const h = w / this._ratio

    const getPos = () => {
      return [random(-w, w), random(-h, h), 0]
    }

    const n = 4

    for (let j = 0; j < numParticles; j++) {
      for (let i = 0; i < numParticles; i++) {
        // positions.push([random(-range, range), random(-range, range), random(-range, range)]);
        const pos = getPos()
        positions.push(pos)

        ux = i / numParticles * 2.0 - 1.0 + 0.5 / numParticles
        uy = j / numParticles * 2.0 - 1.0 + 0.5 / numParticles

        extras.push([randomGaussian(n), randomGaussian(n), randomGaussian(n)])
        coords.push([ux, uy])
        mapUV.push([pos[0] / w * 0.5 + 0.5, pos[1] / h * 0.5 + 0.5])
        indices.push(count)
        count++
      }
    }

    this.mesh = new alfrid.Mesh(GL.POINTS)
    this.mesh.bufferVertex(positions)
    this.mesh.bufferData(extras, 'aExtra', 3)
    this.mesh.bufferData(mapUV, 'aMapUV', 2)
    this.mesh.bufferTexCoord(coords)
    this.mesh.bufferIndex(indices)
  }

  render (state = 0) {
    this.shader.bind()
    GL.draw(this.mesh)
  }
}

export default ViewSave
