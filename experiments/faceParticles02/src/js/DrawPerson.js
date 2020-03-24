import { Draw, GL } from 'alfrid'

import Assets from './Assets'

import fs from 'shaders/person.frag'

class DrawPerson extends Draw {
  constructor () {
    super()
    this.setMesh(Assets.get('person'))
      .useProgram(null, fs)

    const { mat4, vec3 } = window
    this.mtx = mat4.create()

    const dist = 0.8
    mat4.translate(this.mtx, this.mtx, vec3.fromValues(2 * dist, -7.5, 4 * dist))
    mat4.rotateX(this.mtx, this.mtx, Math.PI * 0.1)
    mat4.rotateY(this.mtx, this.mtx, Math.PI * 0.6)

    const s = 0.6
    mat4.scale(this.mtx, this.mtx, vec3.fromValues(s, s, s))
  }

  draw (mPosLight) {
    GL.pushMatrix()
    GL.rotate(this.mtx)

    this.uniform('uPosLight', 'vec3', mPosLight)
    super.draw()

    GL.popMatrix()
  }
}

export default DrawPerson
