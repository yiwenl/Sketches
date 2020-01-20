// index.js

export { saveImage } from './saveImage'
export { resize } from './resizeCanavs'

export const map = (v, s, e, ns, ne) => {
  let p = (v - s) / (e - s)

  if (p > 1) {
    p = 1
  } else if (p < 0) {
    p = 0 //
  }

  return ns + p * (ne - ns)
}

export const definesToString = function (defines) {
  let outStr = ''
  for (const def in defines) {
    if (defines[def]) {
      outStr += '#define ' + def + ' ' + defines[def] + '\n'
    }
  }
  return outStr
}

export const getMidPoint = (...args) => {
  const numPoints = args.length
  let midPoint = []
  for (let i = 0; i < args.length; i++) {
    for (let j = 0; j < args[i].length; j++) {
      if (midPoint[j] === undefined) {
        midPoint[j] = 0
      }

      midPoint[j] += args[i][j]
    }
  }

  midPoint = midPoint.map(v => v / numPoints)

  return midPoint
}
