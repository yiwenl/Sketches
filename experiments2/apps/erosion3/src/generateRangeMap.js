import { GL, Draw, Geom, ShaderLibs, FrameBuffer } from "@alfrid";

import Constants from "./Constants.js";
import { random } from "@utils";
import fs from "./shaders/range-map.frag";

let fbo, draw;
let noiseStrength = 1.0;
let distortionStrength = 1.0;

export default function generateRangeMap(mGenerator) {
  const { TEXTURE_SIZE: size } = Constants;
  const MAP_SIZE = Constants.MAP_SIZE;
  const MAP_TEXTURE_SETTINGS = {
    minFilter: GL.LINEAR,
    magFilter: GL.LINEAR,
    type: GL.FLOAT,
  };

  if (!fbo) {
    let numLines = 0;
    mGenerator.traverse(() => {
      numLines++;
    });

    const _fs = fs.replace("$NUM_LINES", numLines);

    fbo = new FrameBuffer(size, size, MAP_TEXTURE_SETTINGS);
    draw = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, _fs)
      .bindFrameBuffer(fbo)
      .setClearColor(0, 0, 0, 0)
      .uniform("uSeed", random(1000));
  }

  let lines = [];
  mGenerator.traverse((parent, child) => {
    lines.push({ pointA: parent.position, pointB: child.position });
  });

  const pointAs = [];
  const pointBs = [];

  lines.forEach(({ pointA, pointB }) => {
    let u = (pointA[0] + MAP_SIZE) / (MAP_SIZE * 2);
    let v = (pointA[1] + MAP_SIZE) / (MAP_SIZE * 2);
    pointAs.push(u, v);
    u = (pointB[0] + MAP_SIZE) / (MAP_SIZE * 2);
    v = (pointB[1] + MAP_SIZE) / (MAP_SIZE * 2);
    pointBs.push(u, v);
  });

  draw
    .uniform("uPointAs", "vec2", pointAs)
    .uniform("uPointBs", "vec2", pointBs)
    .uniform("uNoiseStrength", noiseStrength)
    .uniform("uDistortionStrength", distortionStrength)
    .draw();

  return fbo.texture;
}
