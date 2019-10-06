import DrawFlip from './DrawFlip'

class FlipBoard {
  constructor () {
    this._draws = [
      new DrawFlip(),
      new DrawFlip()
    ]

    this._draws[0].reset()
    this._draws[1].reset(true)
  }

  swap () {
    this._draws = this._draws.reverse()
  }

  open (textureMap) {
    this.curr.reset()
    this.curr.uniformTexture('textureMap', textureMap, 1)
    this.curr.open()
    this.prev.close()

    setTimeout(() => {
      this.curr.z = 0.01
      this.prev.z = 0.0
      this.swap()
    }, 200)
  }

  render () {
    this._draws.forEach(draw => draw.draw())
  }

  get curr () {
    return this._draws[0]
  }

  get prev () {
    return this._draws[1]
  }
}

export default FlipBoard
