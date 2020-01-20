import alfrid, { GL } from 'alfrid'
import Assets from './Assets.js'
import Config from './Config.js'
import { definesToString, getMidPoint } from './utils'

import vs from 'shaders/sphere.vert'
import fs from 'shaders/sphere.frag'

class ViewSphere extends alfrid.View {
  constructor () {
    const defines = {
      USE_TEX_LOD: GL.getExtension('EXT_shader_texture_lod') ? 1 : 0,
      USE_IBL: 1,
      HAS_BASECOLORMAP: 1,
      HAS_NORMALMAP: 1,
      HAS_EMISSIVEMAP: 1,
      HAS_OCCLUSIONMAP: 0
    }
    const defineStr = definesToString(defines)
    // console.log(defineStr);
    const _vs = `${defineStr}\n${vs}`
    const _fs = `${defineStr}\n${fs}`

    super(_vs, _fs)
  }

  _init () {
    const mesh = Assets.get('sphere')

    const { vertices, coords } = mesh

    const positions = []
    const uvs = []
    const indices = []
    const normals = []
    const extras = []
    let count = 0

    const addTriangle = (a, b, c, uva, uvb, uvc, ea, eb, ec) => {
      positions.push(a, b, c)
      uvs.push(uva, uvb, uvc)
      extras.push(ea, eb, ec)
      indices.push(count, count + 1, count + 2)
      normals.push(c, c, c)
      count += 3
    }

    for (let i = 0; i < vertices.length; i += 3) {
      const a = vertices[i]
      const b = vertices[i + 1]
      const c = vertices[i + 2]
      const center = getMidPoint(a, b, c)
      const mAB = getMidPoint(a, b)
      const mBC = getMidPoint(b, c)
      const mCA = getMidPoint(c, a)

      const uvA = coords[i]
      const uvB = coords[i + 1]
      const uvC = coords[i + 2]
      const uvCenter = getMidPoint(uvA, uvB, uvC)
      const uvAB = getMidPoint(uvA, uvB)
      const uvBC = getMidPoint(uvB, uvC)
      const uvCA = getMidPoint(uvC, uvA)

      addTriangle(a, mAB, center, uvA, uvAB, uvCenter, [0, 0], [1, 0], [0, 0])
      addTriangle(mAB, b, center, uvAB, uvB, uvCenter, [1, 0], [0, 0], [0, 0])
      addTriangle(b, mBC, center, uvB, uvBC, uvCenter, [0, 0], [1, 0], [0, 0])
      addTriangle(mBC, c, center, uvBC, uvC, uvCenter, [1, 0], [0, 0], [0, 0])
      addTriangle(c, mCA, center, uvC, uvCA, uvCenter, [0, 0], [1, 0], [0, 0])
      addTriangle(mCA, a, center, uvCA, uvA, uvCenter, [1, 0], [0, 0], [0, 0])
    }

    this.mesh = new alfrid.Mesh()
    this.mesh.bufferVertex(positions)
    this.mesh.bufferNormal(normals)
    this.mesh.bufferTexCoord(uvs)
    this.mesh.bufferData(extras, 'aExtra')
    this.mesh.bufferIndex(indices)

    this.speed = 0.0025
    this.time = Math.random() * 0xFF

    Assets.get('normal').wrapS = Assets.get('normal').wrapT = GL.MIRRORED_REPEAT
    Assets.get('specular').wrapS = Assets.get('specular').wrapT = GL.MIRRORED_REPEAT
    Assets.get('diffuse').wrapS = Assets.get('diffuse').wrapT = GL.MIRRORED_REPEAT

    this.shader.bind()
    this.shader.uniform('uLightDirection', 'vec3', [0.5, 0.5, 0.5])
    this.shader.uniform('uLightColor', 'vec3', [1, 1, 1])

    this.shader.uniform('uScaleDiffBaseMR', 'vec4', [0, 0, 0, 0])
    this.shader.uniform('uScaleFGDSpec', 'vec4', [0, 0, 0, 0])
    this.shader.uniform('uScaleIBLAmbient', 'vec4', [1, 1, 1, 1])
    this.shader.uniform('uOcclusionStrength', 'float', 1)
    this.shader.uniform('uNormalScale', 'float', 10)
  }

  render (textureMap) {
    this.time += this.speed
    this.shader.bind()
    this.shader.uniform('uTime', 'float', this.time)

    this.shader.uniform('uBRDFMap', 'uniform1i', 0)
    Assets.get('brdfLUT').bind(0)
    this.shader.uniform('uRadianceMap', 'uniform1i', 1)
    Assets.get(`studio${Config.lightmap}_radiance`).bind(1)
    this.shader.uniform('uIrradianceMap', 'uniform1i', 2)
    Assets.get(`studio${Config.lightmap}_irradiance`).bind(2)

    this.shader.uniform('uNormalMap', 'uniform1i', 3)
    Assets.get('normal').bind(3)

    this.shader.uniform('uEmissiveMap', 'uniform1i', 4)
    Assets.get('specular').bind(4)

    this.shader.uniform('uColorMap', 'uniform1i', 5)
    Assets.get('diffuse').bind(5)

    this.shader.uniform('uMap', 'uniform1i', 6)
    textureMap.bind(6)

    this.shader.uniform('uRoughness', 'uniform1f', Config.roughness)
    this.shader.uniform('uMetallic', 'uniform1f', Config.metallic)
    this.shader.uniform('uCameraPos', 'vec3', GL.camera.position)

    GL.draw(this.mesh)
  }
}

export default ViewSphere
