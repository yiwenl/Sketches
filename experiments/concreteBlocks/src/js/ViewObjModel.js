// ViewObjModel.js

import alfrid, { GL } from 'alfrid'
import Assets from './Assets'

import vs from '../shaders/pbr.vert'
import fs from '../shaders/pbr.frag'
import getColorTheme from 'get-color-themes'
import { getRandomElement } from 'randomutils'

import Config from './Config'
const BLOCK_SCALE = 2

const definesToString = function (defines) {
  let outStr = ''
  for (const def in defines) {
    	if (defines[def]) {
    		outStr += '#define ' + def + ' ' + defines[def] + '\n'
    	}
  }
  return outStr
}

class ViewObjModel extends alfrid.View {
  constructor () {
    const defines = {
      USE_TEX_LOD: GL.getExtension('EXT_shader_texture_lod') ? 1 : 0,
      USE_IBL: 1,
      HAS_BASECOLORMAP: 1,
      HAS_NORMALMAP: 1,
      HAS_EMISSIVEMAP: 0,
      HAS_OCCLUSIONMAP: 0
    }
    const defineStr = definesToString(defines)
    // console.log(defineStr);
    const _vs = `${defineStr}\n${vs}`
    const _fs = `${defineStr}\n${fs}`

    super(_vs, _fs)
  }

  _init () {
    const scale = BLOCK_SCALE
    // this.mesh = Assets.get('model')
    const s = 0.1 / scale
    this.mesh = alfrid.Geom.cube(s, s, s)

    // instancing
    const num = 10 * scale
    const posOffsets = []
    const extras = []
    const colors = []
    const colorTheme = getColorTheme()
    console.table(colorTheme)
    console.log(getRandomElement)

    for (let i = -num; i <= num; i++) {
      for (let j = -num; j <= num; j++) {
        const x = i * s
        const y = j * s
        posOffsets.push([x, y, 0])
        extras.push([Math.random(), Math.random(), Math.random()])
        colors.push(getRandomElement(colorTheme))
      }
    }
    this.mesh.bufferInstance(posOffsets, 'aPosOffset')
    this.mesh.bufferInstance(extras, 'aExtra')
    this.mesh.bufferInstance(colors, 'aColor')

    this.baseColor = [1, 1, 1]
  }

  render (textureRad, textureIrr, mtxShadow, textureShadow) {
    const s = textureShadow.width < 128 ? 1024 : textureShadow.width * 0.5

    this.shader.bind()
    this.shader.uniform('uMapSize', 'vec2', [s, s])
    this.shader.uniform('uShadowMatrix', 'mat4', mtxShadow)

    this.shader.uniform('uColorMap', 'uniform1i', 0)
    Assets.get(`${Config.texture}_diffuse`).bind(0)

    this.shader.uniform('uNormalMap', 'uniform1i', 1)
    Assets.get(`${Config.texture}_normal`).bind(1)

    this.shader.uniform('uAoMap', 'uniform1i', 2)
    Assets.get(`${Config.texture}_specular`).bind(2)

    this.shader.uniform('uShadowMap', 'uniform1i', 3)
    textureShadow.bind(3)

    this.shader.uniform('uBRDFMap', 'uniform1i', 4)
    Assets.get('brdfLUT').bind(4)

    this.shader.uniform('uRadianceMap', 'uniform1i', 5)
    this.shader.uniform('uIrradianceMap', 'uniform1i', 6)
    this.shader.uniform('uNormalScale', 'float', Config.normalScale)
    this.shader.uniform('uUVScale', 'float', Config.uvScale / BLOCK_SCALE)
    this.shader.uniform('uExposure', 'float', Config.exposure)

    textureRad.bind(5)
    textureIrr.bind(6)

    this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor)
    this.shader.uniform('uRoughness', 'uniform1f', Config.roughness)
    this.shader.uniform('uMetallic', 'uniform1f', Config.metallic)
    this.shader.uniform('uSpecular', 'uniform1f', this.specular)

    //	pbr
    this.shader.uniform('uLightDirection', 'vec3', [0.5, 0.5, 0.5])
    const g = 0.2
    this.shader.uniform('uLightColor', 'vec3', [g, g, g])

    this.shader.uniform('uScaleDiffBaseMR', 'vec4', [0, 0.5, 0, 0.1])
    this.shader.uniform('uScaleFGDSpec', 'vec4', [0, 0, 0, 0])
    this.shader.uniform('uScaleIBLAmbient', 'vec4', [1, 1, 1, 1])
    this.shader.uniform('uEnvRot', 'vec2', [Config.envRx, Config.envRy])

    this.shader.uniform('uCameraPos', 'vec3', GL.camera.position)
    this.shader.uniform('uOcclusionStrength', 'float', 1)
    this.shader.uniform('uTime', 'float', alfrid.Scheduler.deltaTime)
    this.shader.uniform('uShadowStrength', 'float', Config.shadowStrength)

    GL.draw(this.mesh)
  }
}

export default ViewObjModel
