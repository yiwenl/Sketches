import { Draw, FrameBuffer, GL, Geom } from "@alfrid";
import Constants from "./Constants";
import Config from "./Config";
import { random } from "@utils";

import vs from "./shaders/erosion-gen.vert";
import fs from "./shaders/erosion-gen.frag";
import generateSplatMap from "./generateSplatMap";

let draw, fbo;

export default function generateErosionMap(mDroplets) {
  const { TEXTURE_SIZE: size } = Constants;
  const { numDroplets: num } = Config;

  if (!fbo) {
    const EROSION_MAP_TEXTURE_SETTINGS = {
      type: GL.FLOAT,
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    };
    fbo = new FrameBuffer(size, size, EROSION_MAP_TEXTURE_SETTINGS);

    const positions = [];
    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        positions.push([
          i / num + 0.5 / num,
          j / num + 0.5 / num,
          random(0.5, 2),
        ]);
      }
    }

    const splatMap = generateSplatMap();

    const splatSize = 0.2 * Config.splatScale;

    const mesh = Geom.plane(splatSize, splatSize, 1);
    mesh.bufferInstance(positions, "aPosOffset");

    draw = new Draw()
      .setMesh(mesh)
      .useProgram(vs, fs)
      .setClearColor(0, 0, 0, 0)
      .bindFrameBuffer(fbo)
      .bindTexture("uSplatMap", splatMap, 3)
      .uniform("uMapSize", Constants.MAP_SIZE);
  }

  GL.disable(GL.DEPTH_TEST);
  GL.enableAdditiveBlending();
  draw
    .bindTexture("uPosMap", mDroplets.getTexture(0), 0)
    .bindTexture("uVelMap", mDroplets.getTexture(1), 1)
    .bindTexture("uDebugMap", mDroplets.getTexture(2), 2)
    .draw();

  GL.enable(GL.DEPTH_TEST);
  GL.enableAlphaBlending();

  return fbo.texture;
}
