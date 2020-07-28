import alfrid, { GL } from 'alfrid'

let bLine, bBall

const draw = (camera, mColor = [0, 1, 0]) => {
  if (!bLine) {
    bLine = new alfrid.BatchLine()
    bBall = new alfrid.BatchBall()
  }

  const mtx = mat4.create()

  mat4.mul(mtx, camera.projection, camera.matrix)
  mat4.invert(mtx, mtx)

  let points = [
    [1, 1, -1, 1],
    [-1, 1, -1, 1],
    [1, -1, -1, 1],
    [-1, -1, -1, 1],

    [1, 1, 1, 1],
    [-1, 1, 1, 1],
    [1, -1, 1, 1],
    [-1, -1, 1, 1]
  ]

  const lines = [
    [0, 1],
    [1, 3],
    [3, 2],
    [2, 0],

    [4, 5],
    [5, 7],
    [7, 6],
    [6, 4],

    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7]
  ]

  points = points.map(p => {
    vec4.transformMat4(p, p, mtx)
    p[0] /= p[3]
    p[1] /= p[3]
    p[2] /= p[3]
    return [p[0], p[1], p[2]]
  })

  const s = 0.02
  points.forEach(p => {
    bBall.draw(p, [s, s, s], mColor)
  })

  lines.forEach(l => {
    bLine.draw(points[l[0]], points[l[1]], mColor)
  })
}

export default draw
