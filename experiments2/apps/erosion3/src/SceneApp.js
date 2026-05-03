import {
  GL,
  Scene,
  DrawAxis,
  DrawCopy,
  DrawBall,
  DrawLine,
  DrawCamera,
  FboPingPong,
  FrameBuffer,
  CameraOrtho,
  Object3D,
  EaseNumber,
} from "@alfrid";
import Config from "./Config";
import {
  TargetSizeStrategy,
  FullscreenStrategy,
} from "./strategies/RenderStrategy";
import Constants from "./Constants";
import Scheduler from "scheduling";
import { biasMatrix } from "@utils";

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
import DrawAddBaseNoise from "./DrawAddBaseNoise";
import MountainRangeGenerator from "./MountainRangeGenerator";
import MountainLinesExporter from "./MountainLinesExporter";
import PlotExport from "./PlotExport";
import calculateShadow from "./utils/calculateShadow";

import { vec3, mat4 } from "gl-matrix";

export default class SceneApp extends Scene {
  constructor() {
    super();

    // Choose strategy based on configuration
    this.renderStrategy = Config.useTargetSize
      ? new TargetSizeStrategy()
      : new FullscreenStrategy();

    // Initialize with the chosen strategy
    this.renderStrategy.init(GL.canvas);
    this.renderStrategy.resize(this.camera);

    // initialize normal and erosion maps
    this._normalMap = generateNormalMap(this._heightMap.read.texture);
    this._erosionMap = generateErosionMap(this._fboDroplets.read);
  }

  _init() {
    this.containerMountain = new Object3D();
    this.containerLines = new Object3D();
    this.layerDistance = new EaseNumber(0, 0.05);

    this.orbitalControl.rx.value = -0.6;
    this.orbitalControl.ry.value = 0.9;
    this.orbitalControl.radius.value = 35;
    this.orbitalControl.radius.limit(5, 50);
    this.camera.setPerspective((15 * Math.PI) / 180, GL.aspectRatio, 5, 80);

    this.step = 0;

    const exportPlot = () => {
      // calculate shadow

      const shadowSize = 1024;
      const fboShadowDepth = new FrameBuffer(shadowSize, shadowSize, {
        type: GL.FLOAT,
        minFilter: GL.LINEAR,
        magFilter: GL.LINEAR,
      });

      fboShadowDepth.bind();
      GL.clear(0, 0, 0, 0);
      GL.setMatrices(this._cameraLight);
      this.drawMountain(false, true);
      fboShadowDepth.unbind();

      const { width, height } = GL;
      const fbo = new FrameBuffer(width, height, {
        type: GL.FLOAT,
        minFilter: GL.LINEAR,
        magFilter: GL.LINEAR,
      });
      fbo.bind();
      GL.clear(0, 0, 0, 0);
      GL.setMatrices(this.camera);
      this.drawMountain(false, true);
      fbo.unbind();

      this._depth = fbo.texture;

      this._shadowDepth = fboShadowDepth.texture;

      calculateShadow(
        this._lines,
        this._light,
        this._mtxShadow,
        this._shadowDepth,
        this._depth,
        this.camera.matrix
      );

      const targetSize = {
        width: 148,
        height: 210,
      };

      PlotExport(
        this._lines,
        this.camera,
        GL.canvas.width,
        GL.canvas.height,
        targetSize,
        this._light
      );
    };

    // shadow
    this._lightBase = [2, 1, 2].map((v) => v * 2);
    this._light = vec3.create();
    this._lightDir = vec3.create();
    const r = 4.5;
    this._cameraLight = new CameraOrtho(-r, r, r, -r, 3, 15);
    this._mtxShadow = mat4.create();

    window.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        this.simulate();
      } else if (e.key === "p") {
        this._generatePlots();
      } else if (e.key === "e") {
        if (!this._lines) {
          console.log("No lines to export");
          return;
        }
        exportPlot();
      } else if (e.key === "x") {
        this._generatePlots();
        exportPlot();
      }
    });
  }

  _generatePlots() {
    const heightMap = Config.useSimulation
      ? this._heightMap.read.texture
      : this._rangeMap;
    this._lines = MountainLinesExporter.generate(heightMap, this._normalMap);
    this._dLines = new DrawLines(this._lines);
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

    this._fboDepth = new FrameBuffer(TEXTURE_SIZE, TEXTURE_SIZE, {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    });

    const { numDroplets: num } = Config;
    const DROPPLET_TEXTURE_SETTINGS = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };

    this._fboDroplets = new FboPingPong(num, num, DROPPLET_TEXTURE_SETTINGS, 3);
    const shadowSize = 1024;
    this._fboShadow = new FrameBuffer(shadowSize, shadowSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    });
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();
    this._dLine = new DrawLine();

    this._dMountain = new DrawMountain();
    this._dDroplets = new DrawDroplets();
    this._dAddBaseNoise = new DrawAddBaseNoise();
    new DrawSave().bindFrameBuffer(this._fboDroplets.read).draw();
    this._dSim = new DrawSim();

    this._generator = new MountainRangeGenerator();
    this._treeRoot = this._generator.generateTree(5, 3, 1, 2, 15);
    this._nodes = this._generator.getAllNodes();
    this._rangeMap = generateRangeMap(this._generator);

    this._heightMap.read.bind();
    GL.clear(0, 0, 0, 0);
    this._dCopy.draw(this._rangeMap);
    this._heightMap.read.unbind();
  }

  update() {
    this.containerMountain.y = -this.layerDistance.value;
    this.containerLines.y = this.layerDistance.value;

    // Update light rotation and shadow matrix
    vec3.copy(this._light, this._lightBase);
    vec3.rotateX(this._light, this._light, [0, 0, 0], Config.lightRotationX);
    vec3.rotateY(this._light, this._light, [0, 0, 0], Config.lightRotationY);

    // Calculate light direction (from light position to target)
    this._lightDir = vec3.create();
    vec3.subtract(this._lightDir, [0, 0, 0], this._light);
    vec3.normalize(this._lightDir, this._lightDir);

    this._cameraLight.lookAt(this._light, [0, 0, 0], [0, 1, 0]);
    const tempMatrix = mat4.create();
    mat4.multiply(
      tempMatrix,
      this._cameraLight.projectionMatrix,
      this._cameraLight.viewMatrix
    );
    mat4.multiply(this._mtxShadow, biasMatrix, tempMatrix);

    if (this.step === Config.numSteps) {
      console.log("Simulation finished");
      // this._generatePlots();
      // this.layerDistance.value = 2.5;
      this.step++;
    }
    if (this.step < Config.numSteps) {
      this.simulate();
      this.step++;
    }
    this.updateShadowMap();
    this.updateDepthMap();
  }

  drawMountain(mShadow, mDepth = false) {
    const { showErosion, useSimulation } = Config;
    const heightMap = useSimulation
      ? this._heightMap.read.texture
      : this._rangeMap;

    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._heightMap.read.texture;

    this._dMountain
      .bindTexture("uHeightMap", heightMap, 0)
      .bindTexture("uNormalMap", this._normalMap, 1)
      .bindTexture("uErosionMap", this._erosionMap, 2)
      .bindTexture("uDepthMap", tDepth, 3)
      .uniform("uMaxHeight", Constants.MAX_HEIGHT)
      .uniform("uShowErosion", showErosion ? 1.0 : 0.0)
      .uniform("uLightPos", this._light)
      .uniform("uLightDir", this._lightDir || [0, -1, 0])
      .uniform("uSpotLightAngle", Config.spotLightAngle)
      .uniform("uSpotLightFalloff", Config.spotLightFalloff)
      .uniform("uShadowMatrix", this._mtxShadow)
      .uniform("uLocalMatrix", this.containerMountain.matrix)
      .uniform("uShowDepth", mDepth ? 1.0 : 0.0)
      .draw();
  }

  updateShadowMap() {
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 0);
    GL.setMatrices(this._cameraLight);
    this.drawMountain(false);
    this._fboShadow.unbind();
  }

  updateDepthMap() {
    this._fboDepth.bind();
    GL.clear(0, 0, 0, 0);
    GL.setMatrices(this.camera);
    this.drawMountain(false, true);
    this._fboDepth.unbind();
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

    this._dAddBaseNoise
      .bindFrameBuffer(this._heightMap.write)
      .bindTexture("uHeightMap", this._heightMap.read.texture, 0)
      .draw();

    this._heightMap.swap();
  }

  render() {
    let g = 500;
    GL.clear(...Config.background, 1);
    GL.setMatrices(this.camera);

    if (this._dLines) {
      this._dLines
        .bindTexture("uDepthMap", this._fboShadow.depthTexture, 0)
        .bindTexture("uScreenDepthMap", this._fboDepth.texture, 1)
        .uniform("uShadowMatrix", this._mtxShadow)
        .uniform("uCameraPosition", this.camera.position)
        .uniform("uLinesThreshold", Config.linesThreshold)
        .uniform("uLocalMatrix", this.containerLines.matrix)

        .uniform("uLight", this._light)
        .draw();
    } else {
      this.drawMountain(true);
    }

    g = 0.1;
    this._dBall.draw(
      this._light.map((v) => v * 0.75),
      [g, g, g],
      [1, 0.96, 0.92]
    );
    // this._dCamera.draw(this._cameraLight);

    const debugMaps = [
      // this._fboShadow.depthTexture,
      // heightMap,
      // this._normalMap,
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
