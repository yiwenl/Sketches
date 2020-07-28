import alfrid, { GL } from 'alfrid'

import fs from 'shaders/diffuse.frag'

const getTexture = (mLightPos) => {
  const mapSize = 64
  const fbo = new alfrid.FrameBuffer(mapSize, mapSize)
  const camera = new alfrid.CameraOrtho()
  const s = 1
  camera.ortho(-s, s, s, -s)
  camera.lookAt([0, 0, 5], [0, 0, 0])

  GL.setMatrices(camera)
  new alfrid.Draw()
    .setMesh(alfrid.Geom.sphere(1, 24))
    .useProgram(null, fs)
    .uniform('uLightPos', 'vec3', mLightPos)
    .bindFrameBuffer(fbo)
    .setClearColor(0, 0, 0, 0)
    .draw()

  return fbo.texture
}

export default getTexture
