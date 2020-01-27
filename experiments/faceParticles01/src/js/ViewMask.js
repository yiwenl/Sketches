import alfrid, { GL } from 'alfrid'

import Assets from './Assets'
import Config from './Config'
import vs from 'shaders/mask.vert'
import fs from 'shaders/mask.frag'

class ViewMask extends alfrid.View {
  constructor () {
    super(vs, fs)
  }

  _init () {
    this.mesh = Assets.get('mask')
  }

  render () {
    this.shader.bind()
    this.shader.uniform('uPosition', 'vec3', [0, 0, 0])
    this.shader.uniform('uScale', 'float', 1.0 * Config.maskScale)
    GL.draw(this.mesh)
  }
}

export default ViewMask
