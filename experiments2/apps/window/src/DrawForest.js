import { GL, Draw, Mesh } from "@alfrid";
import Assets from "./Assets";
import { random } from "@utils";
import vs from "./shaders/forest.vert";
import fs from "./shaders/forest.frag";

export default class DrawForest extends Draw {
  constructor() {
    super();

    const objStr = Assets.getSource("forest");
    const positions = [];
    const uvs = [];
    const indices = [];
    let index = 0;
    // v float float float
    const vertexPattern =
      /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

    const lines = objStr.split("\n");
    let result;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      line = line.trim();

      if ((result = vertexPattern.exec(line)) !== null) {
        positions.push([
          parseFloat(result[1]),
          parseFloat(result[2]),
          parseFloat(result[3]),
        ]);

        uvs.push([random(), random()]);
        indices.push(index++);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
