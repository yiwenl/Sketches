import {
  GL,
  Scene,
  DrawAxis,
  DrawCopy,
  DrawBall,
  DrawLine,
  FboPingPong,
} from "@alfrid";
import Config from "./Config";
import {
  TargetSizeStrategy,
  FullscreenStrategy,
} from "./strategies/RenderStrategy";
import Constants from "./Constants";
import Scheduler from "scheduling";

// map generation
import generateHeightMap from "./generateHeightMap";
import generateNormalMap from "./generateNormalMap";
import generateSplatMap from "./generateSplatMap";
import generateRangeMap from "./generateRangeMap";
import generateErosionMap from "./generateErosionMap";
import applyErosion from "./applyErosion";

// draws
import DrawMountain from "./DrawMountain";
import DrawDroplets from "./DrawDroplets";
import DrawSave from "./DrawSave";
import DrawSim from "./DrawSim";
import DrawLines from "./DrawLines";
import MountainRangeGenerator from "./MountainRangeGenerator";
import PlotGenerator from "./plotGenerator";

export default class SceneApp extends Scene {
  constructor() {
    super();

    // Choose strategy based on configuration
    this.renderStrategy = Config.useTargetSize
      ? new TargetSizeStrategy()
      : new FullscreenStrategy();

    // Initialize with the chosen strategy
    this.renderStrategy.init(GL.canvas);

    // initialize normal and erosion maps
    this._normalMap = generateNormalMap(this._heightMap.read.texture);
    this._erosionMap = generateErosionMap(this._fboDroplets.read);
  }

  _init() {
    this.orbitalControl.rx.value = -0.8;
    this.orbitalControl.ry.value = 0.4;
    this.orbitalControl.radius.value = 10;

    window.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        this.simulate();
      } else if (e.key === "p") {
        const heightMap = Config.useSimulation
          ? this._heightMap.read.texture
          : this._rangeMap;
        this._lines = PlotGenerator.generate(heightMap);
        this._dLines = new DrawLines(this._lines);
      }
    });
  }

  _initTextures() {
    this._heightMap = generateHeightMap();
    this._splatMap = generateSplatMap();

    const { TEXTURE_SIZE } = Constants;
    const MAP_TEXTURE_SETTINGS = {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
      type: GL.FLOAT,
    };

    this._fboErosion = new FboPingPong(
      TEXTURE_SIZE,
      TEXTURE_SIZE,
      MAP_TEXTURE_SETTINGS
    );

    const { numDroplets: num } = Config;
    const DROPPLET_TEXTURE_SETTINGS = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };
    this._fboDroplets = new FboPingPong(num, num, DROPPLET_TEXTURE_SETTINGS, 3);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dLine = new DrawLine();

    this._dMountain = new DrawMountain();
    this._dDroplets = new DrawDroplets();

    new DrawSave().bindFrameBuffer(this._fboDroplets.read).draw();
    this._dSim = new DrawSim();

    this._generator = new MountainRangeGenerator();
    this._treeRoot = this._generator.generateTree(5, 3, 1, 2, 15);
    this._nodes = this._generator.getAllNodes();
    this._rangeMap = generateRangeMap(this._generator);
  }

  update() {
    // this.simulate();
    if (!Config.useSimulation && !this._generator.hasSimulationDone) {
      this._rangeMap = generateRangeMap(this._generator);
      this._normalMap = generateNormalMap(this._rangeMap);
    }
  }

  simulate() {
    console.log("Simulating...");
    const timeStep = Scheduler.getDeltaTime() * 0.001;
    this._dSim
      .bindFrameBuffer(this._fboDroplets.write)
      .bindTexture("uPosMap", this._fboDroplets.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fboDroplets.read.getTexture(1), 1)
      .bindTexture("uHeightMap", this._heightMap.read.texture, 2)
      .uniform("uTimeStep", timeStep)
      .uniform("uMapSize", Constants.MAP_SIZE)
      .uniform("uMinSlope", Config.minSlope)
      .uniform("uGravity", Config.gravity)
      .uniform("uInertia", Config.inertia)
      .uniform("uEvaporationRate", Config.evaporationRate)
      .uniform("uErosionRate", Config.erosionRate)
      .uniform("uDepositionRate", Config.depositionRate)
      .draw();

    this._fboDroplets.swap();

    applyErosion(this._heightMap, this._erosionMap);

    // update normal and erosion maps
    this._normalMap = generateNormalMap(this._heightMap.read.texture);
    this._erosionMap = generateErosionMap(this._fboDroplets.read);
  }

  render() {
    let g = 500;
    GL.clear(...Config.background, 1);
    GL.setMatrices(this.camera);

    const { showDroplets, showErosion, useSimulation } = Config;

    this._dAxis.draw();

    const heightMap = useSimulation
      ? this._heightMap.read.texture
      : this._rangeMap;

    this._dMountain
      .bindTexture("uHeightMap", heightMap, 0)
      .bindTexture("uNormalMap", this._normalMap, 1)
      .bindTexture("uErosionMap", this._erosionMap, 2)
      .uniform("uMaxHeight", Constants.MAX_HEIGHT)
      .uniform("uShowErosion", showErosion ? 1.0 : 0.0)
      .draw();

    if (this._dLines) {
      this._dLines.draw();
    }

    if (showDroplets) {
      this._dDroplets
        .bindTexture("uPosMap", this._fboDroplets.read.getTexture(0), 0)
        .bindTexture("uHeightMap", this._heightMap.read.texture, 1)
        .bindTexture("uDebugMap", this._fboDroplets.read.getTexture(2), 2)
        .uniform("uMapSize", Constants.MAP_SIZE)
        .uniform("uViewport", [GL.canvas.width, GL.canvas.height])
        .draw();
    }

    // Render tree nodes and connections
    if (this._generator && this._treeRoot && 0) {
      const y = 3;

      // Draw connections between parent and child nodes
      this._generator.traverse((parent, child) => {
        const parentPos = [parent.x, y, parent.y];
        const childPos = [child.x, y, child.y];
        const lineColor = [0.5, 0.5, 0.5]; // Gray color for connections
        this._dLine.draw(parentPos, childPos, lineColor);
      });

      // Draw nodes as balls
      if (this._nodes) {
        this._nodes.forEach((node) => {
          // x -> x, y -> z, random y
          const pos = [node.x, y, node.y];
          const size = 0.03;
          const color = [1, 1, 1];
          this._dBall.draw(pos, [size, size, size], color);
        });
      }
    }

    const debugMaps = [
      heightMap,
      this._normalMap,
      // this._erosionMap,
      // this._splatMap,
      // this._rangeMap,
      // this._fboDroplets.read.getTexture(0),
      // this._fboDroplets.read.getTexture(2),
    ];
    g = Math.min(GL.width / debugMaps.length, 500);
    debugMaps.forEach((map, index) => {
      GL.viewport(index * g, 0, g, g);
      this._dCopy.draw(map);
    });
  }

  resize() {
    this.renderStrategy?.resize(this.camera);
  }
}
