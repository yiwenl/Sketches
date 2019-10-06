
import alfrid, { TouchDetector, EventDispatcher } from 'alfrid'
import Config from './Config'
const { vec3 } = window

const getTextureSpacePos = (value, mOffset = 0) => {
  let p = value / Config.PLANE_SIZE * 2
  p = p * 0.5 + 0.5

  return Config.TEXTURE_SIZE * p + mOffset
}

class Touch extends EventDispatcher {
  constructor (mCamera) {
    super()
    const size = Config.PLANE_SIZE
    const mesh = alfrid.Geom.plane(size, size, 1)

    this._detector = new TouchDetector(mesh, mCamera)

    this._detector.on('onHit', (e) => this._onMove(e))
    this._detector.on('onUp', (e) => this._onUp(e))

    this._position = vec3.create()
    this._prePos = vec3.create()

    this._isHit = false
  }

  _onUp (e) {
    this._isHit = false
  }

  _onMove (e) {
    const { hit } = e.detail
    hit[2] *= -1
    if (!this._isHit) {
      vec3.copy(this._prePos, hit)
      vec3.copy(this._position, hit)
    } else {
      vec3.copy(this._prePos, this._position)
      vec3.copy(this._position, hit)
    }

    this._isHit = true

    const scale = 220
    const zOffset = 0
    const x = getTextureSpacePos(this._position[0])
    const z = getTextureSpacePos(this._position[1], -zOffset)
    const dx = (x - getTextureSpacePos(this._prePos[0])) * scale
    const dz = -(z - getTextureSpacePos(this._prePos[1], -zOffset)) * scale

    this.trigger('onDrag', {
      x,
      y: z,
      dx,
      dy: dz,
      radius: 0.001
    })
  }
}

export default Touch
