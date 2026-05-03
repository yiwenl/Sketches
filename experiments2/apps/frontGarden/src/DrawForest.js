import { GL, Mesh, Draw } from "@alfrid";
import { loadPLYFile, parsePLY } from "./utils/plyLoader";
import { random } from "@utils";
import { vec3, mat4 } from "gl-matrix";

// import Config from "./Config";

import vs from "./shaders/forest.vert";
import fs from "./shaders/forest.frag";

export const NUM_REGIONS = 10;

export default class DrawForest extends Draw {
  constructor() {
    super();

    this._isReady = false;
    this._loadProgressPercent = 0;
    this._positions = null;
    this._colors = null;
    // Set precision to control decimal places (undefined = full precision)
    // Example: 2 = keep 2 decimal places, 3 = keep 3 decimal places
    this._precision = 2;

    this._loadPLYFile("frontGarden02.ply");

    this._regions = [
      [3.36, 3.12, -0.58, 2.38],
      [3.6, -0.82, 0.16, 2.38],
      [3.61, 1.4, -1.8, 1.08],
      [3.61, 2.13, 1.64, 1.49],
      [3.61, 0.9, 1.4, 1.49],
      [1.4, -1.06, 0.17, 1.97],
      [0.41, 1.4, 1.15, 0.82],
      [0.41, -0.57, 1.64, 0.82],
      [0.41, 0.17, 1.15, 0.82],
      [-0.08, -0.82, -1.06, 0.75],
    ];

    console.table(this._regions.length);

    while (this._regions.length < NUM_REGIONS) {
      this._regions.push([0, 0, 0, 0]);
    }

    console.table(this._regions);
  }

  _loadPLYFile(url) {
    loadPLYFile(url, {
      onProgress: (percent) => {
        this._loadProgressPercent = percent || 0;
        console.log(`Loading PLY file: ${percent}%`);
      },
      onComplete: (data) => {
        this._processPLYData(data);
      },
      onError: (error) => {
        console.error("Failed to load PLY file:", error);
      },
    });
  }

  _processPLYData(data) {
    try {
      // Parse PLY file and extract vertex positions and colors (if available)
      const parsed = parsePLY(data, {
        precision: this._precision,
        normalizeColors: true, // Normalize colors to 0-1 range
      });

      const modelScale = 0.5;
      const offsetY = -4;
      const modelMatrix = mat4.create();
      const translation = [0, offsetY, 0];
      mat4.scale(modelMatrix, modelMatrix, [
        modelScale,
        modelScale,
        modelScale,
      ]);
      mat4.translate(modelMatrix, modelMatrix, translation);

      // Transform positions
      this._positions = parsed.positions.map((v) =>
        vec3.transformMat4(v, v, modelMatrix)
      );

      // Store colors if available
      this._colors = parsed.colors || null;

      console.log(`Parsed ${this._positions.length} vertices`);
      if (this._colors) {
        console.log(`Parsed ${this._colors.length} color values`);
      } else {
        this._colors = this._positions.map(() => [1, 1, 1]);
      }

      const uv = this._positions.map(() => [random(), random()]);
      const indices = this._positions.map((_, i) => i);

      const mesh = new Mesh(GL.POINTS)
        .bufferVertex(this._positions)
        .bufferTexCoord(uv)
        .bufferData(this._colors, "aColor")
        .bufferIndex(indices);

      // Add color buffer if colors are available
      if (this._colors) {
        // mesh.bufferColor(this._colors);
      }

      const _vs = vs.replace("$NUM_REGIONS", NUM_REGIONS);

      this.setMesh(mesh).useProgram(_vs, fs);
      this._isReady = true;
    } catch (error) {
      console.error("Error parsing PLY file:", error);
    }
  }

  draw() {
    // const { regionX, regionY, regionZ, regionIndex, regionRadius } = Config;
    // const region = this._regions[regionIndex];
    // region[0] = regionX;
    // region[1] = regionY;
    // region[2] = regionZ;
    // region[3] = regionRadius;
    this.uniform("uRegions", "vec4", this._regions.flat());
    super.draw();
  }

  get regions() {
    return this._regions;
  }

  get points() {
    return this._positions;
  }

  get isReady() {
    return this._isReady;
  }

  get loadProgress() {
    return this._loadProgressPercent;
  }

  get positions() {
    return this._positions;
  }

  get colors() {
    return this._colors;
  }

  /**
   * Set the precision for vertex coordinates
   * @param {number|undefined} precision - Number of decimal places to keep (undefined = full precision)
   */
  setPrecision(precision) {
    this._precision = precision;
  }
}
