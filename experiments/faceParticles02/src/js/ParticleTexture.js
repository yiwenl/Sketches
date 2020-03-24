// ParticleTexture.js

import alfrid, { GL, FrameBuffer, CameraOrtho, CameraPerspective } from 'alfrid'
import Assets from './Assets'
import Config from './Config'
import vs from '../shaders/pbr.vert'
import fs from '../shaders/pbr.frag'

import { definesToString } from './utils'

class ParticleTexture extends FrameBuffer {
  constructor () {
    const defines = {
      USE_TEX_LOD: GL.getExtension('EXT_shader_texture_lod') ? 1 : 0,
      USE_IBL: 1,
      HAS_BASECOLORMAP: 0,
      HAS_NORMALMAP: 0,
      HAS_EMISSIVEMAP: 0,
      HAS_OCCLUSIONMAP: 0
    }
    const defineStr = definesToString(defines)
    // console.log(defineStr);
    const _vs = `${defineStr}\n${vs}`
    const _fs = `${defineStr}\n${fs}`

    const s = 64
    super(s, s, { minFilter: GL.LINEAR, magFilter: GL.LINEAR })

    const textureRad = Assets.get('studio_radiance')
    const textureIrr = Assets.get('irr')

    const camera = new CameraPerspective()
    camera.setPerspective(45 * Math.PI / 180, 1, 0.1, 100)
    camera.lookAt([0, 0, 5], [0, 0, 0])

    const baseColor = [1, 1, 1]

    const mesh = alfrid.Geom.sphere(1.8, 36)
    const shader = new alfrid.GLShader(_vs, _fs)
    this.bind()
    GL.clear(0, 0, 0, 0)
    GL.setMatrices(camera)
    shader.bind()

    shader.uniform('uBRDFMap', 'uniform1i', 0)
    Assets.get('brdfLUT').bind(0)

    shader.uniform('uRadianceMap', 'uniform1i', 1)
    textureRad.bind(1)

    shader.uniform('uIrradianceMap', 'uniform1i', 2)
    textureIrr.bind(2)

    shader.uniform('uBaseColor', 'uniform3fv', baseColor)
    shader.uniform('uRoughness', 'uniform1f', Config.roughness)
    shader.uniform('uMetallic', 'uniform1f', 0.1)

    shader.uniform('uLightDirection', 'vec3', [0, 10, 0])
    shader.uniform('uLightColor', 'vec3', [1, 1, 1])

    shader.uniform('uScaleDiffBaseMR', 'vec4', [0, 0, 0, 0])
    shader.uniform('uScaleFGDSpec', 'vec4', [0, 0, 0, 0])
    shader.uniform('uScaleIBLAmbient', 'vec4', [1, 1, 1, 1])

    shader.uniform('uCameraPos', 'vec3', [5, 0, 0])
    shader.uniform('uOcclusionStrength', 'float', 1)

    GL.draw(mesh)
    this.unbind()
  }
}

export default ParticleTexture
