// FluidSimulation.js
import alfrid, { GL, FboPingPong, Draw, mul } from "alfrid";
import Assets from "./Assets";
import FluidSettings from "./FluidSettings";

import fsAdvect from "shaders/advect.frag";
import fsDivergence from "shaders/divergence.frag";
import fsClear from "shaders/clear.frag";
import fsJacobi from "shaders/jacobi.frag";
import fsGradientSub from "shaders/gradientSubstract.frag";
import fsSplat from "shaders/splat.frag";
import fsSplat2 from "shaders/splat2.frag";
import { random } from "randomutils";

class FluidSimulation {
  constructor(mCamera) {
    this.mouse = [0, 0, 0];
    this._camera = mCamera;
    this._texelSize = [
      1 / FluidSettings.TEXTURE_SIZE,
      1 / FluidSettings.TEXTURE_SIZE,
    ];

    this._initTextures();
    this._initShaders();
  }

  _initShaders() {
    const mesh = alfrid.Geom.bigTriangle();
    this.mesh = mesh;
    const vs = alfrid.ShaderLibs.bigTriangleVert;
    //	shaders

    //	draw
    this._drawAdvect = new Draw()
      .useProgram(vs, fsAdvect)
      .setMesh(mesh)
      .setClearColor(0, 0, 0, 1)
      .uniform("uTimestep", "float", 0.001)
      .uniform("uTexelSize", "vec2", this._texelSize);

    this._drawDivergence = new Draw()
      .useProgram(vs, fsDivergence)
      .setMesh(mesh)
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(this._fboDivergence)
      .uniform("uTexelSize", "vec2", this._texelSize);

    this._drawClear = new Draw()
      .useProgram(vs, fsClear)
      .setMesh(mesh)
      .setClearColor(0, 0, 0, 1)
      .uniform("uDissipation", "float", FluidSettings.PRESSURE_DISSIPATION);

    this._drawJacobi = new Draw()
      .useProgram(vs, fsJacobi)
      .setMesh(mesh)
      .setClearColor(0, 0, 0, 1)
      .uniform("uTexelSize", "vec2", this._texelSize);

    this._drawGradient = new Draw()
      .useProgram(vs, fsGradientSub)
      .setMesh(mesh)
      .setClearColor(0, 0, 0, 1)
      .uniform("uTexelSize", "vec2", this._texelSize);

    this._shaderSplat = new alfrid.GLShader(
      alfrid.ShaderLibs.bigTriangleVert,
      fsSplat
    );
    this._shaderSplat.bind();
    this._shaderSplat.uniform("texture", "uniform1i", 1);
    this._shaderSplat.uniform("uTarget", "uniform1i", 0);

    this._drawSplat = new Draw().useProgram(vs, fsSplat2).setMesh(mesh);
  }

  _initTextures() {
    let index = 1;
    this._texture = Assets.get(`liquid`);

    this._texture.minFilter = GL.LINEAR_MIPMAP_NEAREST;
    this._texture.magFilter = GL.LINEAR;
    this._texture.wrapS = this._texture.wrapT = GL.MIRRORED_REPEAT;

    const size = FluidSettings.TEXTURE_SIZE;
    let type = GL.FLOAT;
    if (GL.isMobile) {
      const iOS =
        !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
      if (iOS) {
        type = GL.HALF_FLOAT;
      }
    }

    const oSettings = {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
      wrapS: GL.CLAMP_TO_EDGE,
      wrapT: GL.CLAMP_TO_EDGE,
      type,
    };

    this._fboVelocity = new FboPingPong(size, size, oSettings);
    this._fboDensity = new FboPingPong(size, size, oSettings);
    this._fboPressure = new FboPingPong(size, size, oSettings);
    this._fboDivergence = new alfrid.FrameBuffer(size, size, oSettings);
  }

  advect(target, textureX, dissipation) {
    this._drawAdvect
      .bindFrameBuffer(target)
      .uniformTexture("textureVel", this._fboVelocity.read.texture, 0)
      .uniformTexture("textureMap", textureX, 1)
      .uniform("uDissipation", "float", dissipation)
      .draw();
  }

  createSplat(x, y, dx, dy, radius) {
    radius = radius || FluidSettings.SPLAT_RADIUS;

    this._fboVelocity.write.bind();
    GL.clear(0, 0, 0, 1);

    this._shaderSplat.bind();
    this._shaderSplat.uniform("radius", "float", radius);
    this._shaderSplat.uniform("aspectRatio", "float", 1);
    this._shaderSplat.uniform("point", "vec2", [
      x / FluidSettings.TEXTURE_SIZE,
      y / FluidSettings.TEXTURE_SIZE,
    ]);
    let speed = 1;
    this._shaderSplat.uniform("color", "vec3", [dx * speed, -dy * speed, 1]);
    this._shaderSplat.uniform("uIsVelocity", "float", 1.0);

    this._fboVelocity.read.texture.bind(0);
    this._texture.bind(1);
    GL.draw(this.mesh);
    this._fboVelocity.write.unbind();
    this._fboVelocity.swap();

    // let g = 0.0075;
    let g = 0.0075;
    this._fboDensity.write.bind();
    GL.clear(0, 0, 0, 1);
    this._shaderSplat.uniform("color", "vec3", [g, g, g]);
    this._shaderSplat.uniform("uIsVelocity", "float", 0.0);
    this._fboDensity.read.texture.bind(0);
    GL.draw(this.mesh);
    this._fboDensity.write.unbind();
    this._fboDensity.swap();
  }

  _debugSplat() {
    let radiusScale = 0.95;
    let strength = 500;
    const time = alfrid.Scheduler.deltaTime * 2.0;
    let radius = Math.sin(alfrid.Scheduler.deltaTime) * 0.1 + 0.3;
    const r = 0.2;
    const a = time * 0.5;

    const x = Math.cos(a) * r + 0.5;
    const y = Math.sin(a * 1.897541) * r + 0.5;
    let center = [x, 0.3];

    this.updateFlow(center, [0.0, 1.5]);
    center = [y, 0.7];
    this.updateFlow(center, [0.0, -1.5]);
  }

  updateFlow(mPos, mDir) {
    const radiusScale = 1.5;
    const strength = 1000;
    const time = alfrid.Scheduler.deltaTime * 2.0;
    const radius = 0.2;

    // right
    this._drawSplat
      .bindFrameBuffer(this._fboVelocity.write)
      .uniform("uTime", "float", time)
      .uniform("uCenter", "vec2", mPos)
      .uniform("uRadius", "float", radius * radiusScale * 0.2)
      .uniform("uStrength", "float", strength)
      .uniform("uIsVelocity", "float", 1.0)
      .uniform("uDir", "vec2", mDir)
      .uniformTexture("texture", this._fboVelocity.read.texture, 0)
      .draw();
    this._fboVelocity.swap();

    this._drawSplat
      .bindFrameBuffer(this._fboDensity.write)
      .uniform("uCenter", "vec2", mPos)
      .uniform("uIsVelocity", "float", 0.0)
      .uniform("uStrength", "float", 0.05)
      .uniform("uDir", "vec2", mDir)
      .uniformTexture("texture", this._fboDensity.read.texture, 0)
      .draw();
    this._fboDensity.swap();
  }

  update(mJoints) {
    this._debugSplat();

    mJoints.forEach((joint) => {
      this.updateFlow(joint.pos, [joint.dir[0], joint.dir[1]]);
    });

    //	advect - velocity
    this.advect(
      this._fboVelocity.write,
      this._fboVelocity.read.texture,
      FluidSettings.VELOCITY_DISSIPATION
    );
    this._fboVelocity.swap();

    //	advect - density
    this.advect(
      this._fboDensity.write,
      this._fboDensity.read.texture,
      FluidSettings.DENSITY_DISSIPATION
    );
    this._fboDensity.swap();

    //	divergence
    this._drawDivergence
      .uniformTexture("textureVel", this._fboVelocity.read.texture, 0)
      .draw();

    //	clear
    this._drawClear
      .bindFrameBuffer(this._fboPressure.write)
      .uniformTexture("texturePressure", this._fboPressure.read.texture, 0)
      .draw();
    this._fboPressure.swap();

    //	jacobi
    for (let i = 0; i < FluidSettings.PRESSURE_ITERATIONS; i++) {
      this._drawJacobi
        .bindFrameBuffer(this._fboPressure.write)
        .uniformTexture("texturePressure", this._fboPressure.read.texture, 0)
        .uniformTexture("textureDivergence", this._fboDivergence.texture, 1)
        .draw();

      this._fboPressure.swap();
    }

    //	gradient sub
    this._drawGradient
      .bindFrameBuffer(this._fboVelocity.write)
      .uniformTexture("texturePressure", this._fboPressure.read.texture, 0)
      .uniformTexture("textureVel", this._fboVelocity.read.texture, 1)
      .draw();

    this._fboVelocity.swap();
  }

  get velocity() {
    return this._fboVelocity.read.texture;
  }

  get density() {
    return this._fboDensity.read.texture;
  }

  get divergence() {
    return this._fboDivergence.texture;
  }

  get pressure() {
    return this._fboPressure.read.texture;
  }

  get allTextures() {
    return [this.velocity, this.density, this.divergence, this.pressure];
  }
}

export default FluidSimulation;
