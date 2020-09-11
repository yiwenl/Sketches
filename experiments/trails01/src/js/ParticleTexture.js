// ParticleTexture.js

import alfrid, { GL, FrameBuffer, CameraOrtho, CameraPerspective } from 'alfrid'
import Assets from './Assets'
import Config from './Config'
import vs from '../shaders/pbr.vert'
import fs from '../shaders/diffuse.frag'

class ParticleTexture extends FrameBuffer {
  constructor () {

    const s = 64
    super(s, s, { minFilter: GL.LINEAR, magFilter: GL.LINEAR })

    const camera = new CameraPerspective()
    camera.setPerspective(45 * Math.PI / 180, 1, 0.1, 100)
    camera.lookAt([0, 0, 5], [0, 0, 0])

    const baseColor = [1, 1, 1]

    const mesh = alfrid.Geom.sphere(1.8, 36)
    const shader = new alfrid.GLShader(null, fs)
    this.bind()
    GL.clear(0, 0, 0, 0)
    GL.setMatrices(camera)
    shader.bind()

    GL.draw(mesh)
    this.unbind()
  }
}

export default ParticleTexture
