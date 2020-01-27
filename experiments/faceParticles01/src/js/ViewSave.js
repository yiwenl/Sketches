// ViewSave.js

import alfrid, { GL } from 'alfrid'
import vs from 'shaders/save.vert'
import fs from 'shaders/save.frag'
import Config from './Config'
import { random, randomGaussian } from 'randomutils'

class ViewSave extends alfrid.View {
  constructor () {
    super(vs, fs)
  }

  _init () {
    const positions = []
    const coords = []
    const indices = []
    const extras = []
    let count = 0

    const numParticles = Config.numParticles
    const totalParticles = numParticles * numParticles
    console.debug('Total Particles : ', totalParticles)
    let ux, uy
    let a, r

    const getPos = () => {
      a = random(Math.PI * 2)
      r = Math.sqrt(Math.random()) * Config.maxRadius * 2.0

      return [Math.cos(a) * r, random(-Config.yRange, Config.yRange), Math.sin(a) * r]
    }

    const n = 4

    for (let j = 0; j < numParticles; j++) {
      for (let i = 0; i < numParticles; i++) {
        // positions.push([random(-range, range), random(-range, range), random(-range, range)]);
        positions.push(getPos())

        ux = i / numParticles * 2.0 - 1.0 + 0.5 / numParticles
        uy = j / numParticles * 2.0 - 1.0 + 0.5 / numParticles

        extras.push([randomGaussian(n), randomGaussian(n), randomGaussian(n)])
        coords.push([ux, uy])
        indices.push(count)
        count++
      }
    }

    this.mesh = new alfrid.Mesh(GL.POINTS)
    this.mesh.bufferVertex(positions)
    this.mesh.bufferData(extras, 'aExtra', 3)
    this.mesh.bufferTexCoord(coords)
    this.mesh.bufferIndex(indices)
  }

  render (state = 0) {
    this.shader.bind()
    GL.draw(this.mesh)
  }
}

export default ViewSave
