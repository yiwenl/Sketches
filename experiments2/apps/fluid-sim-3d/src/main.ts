import {
  assertWebGPUSupport,
  AxisHelper,
  beginRenderPass,
  BindGroup,
  Buffer,
  BufferUsage,
  Device,
  Geom,
  HitTestor,
  OrbitalControl,
  PerspectiveCamera,
} from "belfast";
import { mat4, vec3 } from "gl-matrix";
import FluidSimulation from "@fluid-sim-belfast";
import GUI from "lil-gui";
import Stats from "stats.js";
import { ArrowField } from "./ArrowField";

const TEX_SIZE = 32;
const VIS_GRID = 32;
/** World half-extent — volume spans [-MAX_RADIUS, MAX_RADIUS] on each axis. */
const MAX_RADIUS = 1.0;
const VOLUME_EXTENT = MAX_RADIUS * 2;
const random = (a: number, b: number) => {
  return a + Math.random() * (b - a);
};

async function main() {
  await assertWebGPUSupport();

  const canvas = document.createElement("canvas");
  canvas.style.cssText = "display:block;width:100vw;height:100vh;";
  document.body.appendChild(canvas);

  const device = await Device.create(canvas);
  const fluid = new FluidSimulation(
    device,
    {
      TEXTURE_SIZE: TEX_SIZE,
      DENSITY_DISSIPATION: 0.995,
      VELOCITY_DISSIPATION: 0.998,
      PRESSURE_DISSIPATION: 0.96,
      CURL: 20,
    },
    MAX_RADIUS,
  );

  const arrowField = new ArrowField(device, {
    visGrid: VIS_GRID,
    texSize: TEX_SIZE,
    volumeExtent: VOLUME_EXTENT,
    lengthScale: 0.5,
  });

  const RAD = Math.PI / 180;
  const camera = new PerspectiveCamera(55 * RAD, 1, 0.1, 100);
  const control = new OrbitalControl(camera, {
    listenerTarget: canvas,
    center: [0, 0, 0],
    radius: 3.5,
  });

  const axes = new AxisHelper(device, { length: 1.2 });
  const axisUniformBuffer = Buffer.create(
    device,
    Buffer.uniformSize(PerspectiveCamera.uniformByteSize()),
    BufferUsage.uniform,
    "axis-uniforms",
  );
  const cameraUniformData = new Float32Array(
    PerspectiveCamera.uniformFloatCount,
  );
  const axisBindGroup = BindGroup.create(
    device,
    axes.getBindGroupLayout(0),
    axisUniformBuffer,
    0,
    "axis-bind-group",
  );

  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  const sphereGeom = Geom.sphere({ radius: VOLUME_EXTENT * 0.5, segments: 24 });
  const hitTestor = new HitTestor(
    sphereGeom,
    camera,
    [canvas.width, canvas.height],
    { listenerTarget: canvas }
  );

  let firstHit = true;
  const lastHit = vec3.create();

  hitTestor.addEventListener("onHit", ((e: CustomEvent) => {
    const hit = e.detail.hit;
    
    if (firstHit) {
      vec3.copy(lastHit, hit);
      firstHit = false;
      return;
    }

    const dir = vec3.create();
    vec3.sub(dir, hit, lastHit);
    
    const speed = vec3.length(dir);
    // Apply force if there is movement, ignoring massive jumps
    if (speed > 0.001 && speed < 1.0) {
      const d = vec3.clone(dir);
      vec3.normalize(d, d);
      
      // Scale strength by speed so fast swipes carry more momentum.
      // Use a large multiplier to overcome the steep falloff in the force shader.
      const forceStrength = params.strength * (speed * 500.0);
      
      fluid.addForce(
        [hit[0], hit[1], hit[2]],
        [d[0], d[1], d[2]],
        params.radius,
        forceStrength
      );
    }
    vec3.copy(lastHit, hit);
  }) as EventListener);

  const params = {
    strength: 150,
    radius: 0.18,
    lengthScale: 0.5,
    curl: fluid.settings.CURL,
    densityDissipation: 0.995,
    velocityDissipation: 0.998,
    pressureIterations: fluid.settings.PRESSURE_ITERATIONS,
  };

  const gui = new GUI({ title: "Fluid Sim 3D" });
  gui.add(params, "strength", 10, 500).name("Force strength");
  gui.add(params, "radius", 0.04, 0.4).name("Force radius");
  gui.add(params, "lengthScale", 0.05, 2.0).name("Arrow length");
  gui
    .add(params, "curl", 0, 60, 1)
    .name("Curl (vorticity)")
    .onChange((v: number) => {
      fluid.settings.CURL = v;
    });
  gui
    .add(params, "densityDissipation", 0.9, 1.0, 0.001)
    .name("Density decay")
    .onChange((v: number) => {
      fluid.settings.DENSITY_DISSIPATION = v;
    });
  gui
    .add(params, "velocityDissipation", 0.9, 1.0, 0.001)
    .name("Velocity decay")
    .onChange((v: number) => {
      fluid.settings.VELOCITY_DISSIPATION = v;
    });
  gui
    .add(params, "pressureIterations", 1, 40, 1)
    .name("Pressure iters")
    .onChange((v: number) => {
      fluid.settings.PRESSURE_ITERATIONS = v;
    });

  window.addEventListener("beforeunload", () => {
    hitTestor.disconnect();
    control.destroy();
    axes.destroy();
    arrowField.destroy();
    fluid.destroy();
    axisUniformBuffer.destroy();
    gui.destroy();
  });

  let depthTexture: GPUTexture | null = null;
  let lastWidth = 0;
  let lastHeight = 0;
  let lastTime = performance.now();

  const updateAspect = () => {
    if (canvas.width === lastWidth && canvas.height === lastHeight) {
      return;
    }
    lastWidth = canvas.width;
    lastHeight = canvas.height;
    if (lastWidth > 0 && lastHeight > 0) {
      camera.setAspect(lastWidth / lastHeight);
      hitTestor.resolution = [lastWidth, lastHeight];
    }
  };

  const ensureDepthTexture = () => {
    const width = canvas.width;
    const height = canvas.height;
    if (
      depthTexture &&
      depthTexture.width === width &&
      depthTexture.height === height
    ) {
      return depthTexture.createView();
    }
    depthTexture?.destroy();
    depthTexture = device.gpu.createTexture({
      label: "depth-texture",
      size: [width, height],
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    return depthTexture.createView();
  };

  const render = () => {
    stats.begin();
    device.resize();
    updateAspect();

    const now = performance.now();
    const deltaTime = Math.min((now - lastTime) * 0.001, 0.1);
    lastTime = now;

    const colorView = device.getCurrentTexture().createView();
    const depthView = ensureDepthTexture();
    const encoder = device.gpu.createCommandEncoder({
      label: "fluid-sim-3d-frame",
    });

    fluid.update(encoder, deltaTime);

    const pass = beginRenderPass(encoder, colorView, {
      clearColor: { r: 0.04, g: 0.04, b: 0.07, a: 1 },
      depthStencilAttachment: {
        view: depthView,
        depthLoadOp: "clear",
        depthClearValue: 1,
        depthStoreOp: "store",
      },
    });

    arrowField.setLengthScale(params.lengthScale);
    arrowField.draw(
      pass,
      fluid.velocity,
      fluid.density,
      camera.getViewProjectionMatrix(),
    );

    camera.writeUniformData(cameraUniformData);
    axisUniformBuffer.write(device, cameraUniformData);
    axes.draw(pass, axisBindGroup);

    pass.end();
    device.gpu.queue.submit([encoder.finish()]);

    stats.end();
    requestAnimationFrame(render);
  };

  render();
}

main().catch((error) => {
  console.error(error);
});
