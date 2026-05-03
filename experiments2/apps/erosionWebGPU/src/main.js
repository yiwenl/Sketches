import { addCapture } from "@utils";

import Assets from "./Assets";
import Settings from "./Settings";
import Config from "./Config";
import WebGPUContext from "./WebGPUContext";
import PerspectiveCamera from "./camera/PerspectiveCamera";
import OrbitalControl from "./camera/OrbitalControl";
import DrawAxis from "./utils/DrawAxis";
import Terrain from "./terrain/Terrain";

const isDev = process.env.NODE_ENV === "development";
const keepGui = isDev;

let camera;
let control;
let drawAxis;
let terrain;
let depthTextureView;

if (isDev) {
  Settings.init();
}

Assets.load().then(init);

async function init() {
  const canvas = document.createElement("canvas");
  canvas.id = "main-canvas";
  const pixelRatio = 2;
  canvas.width = window.innerWidth * pixelRatio;
  canvas.height = window.innerHeight * pixelRatio;
  document.body.appendChild(canvas);

  await WebGPUContext.init(canvas);

  const { device } = WebGPUContext;

  const depthTexture = device.createTexture({
    size: { width: canvas.width, height: canvas.height },
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });
  depthTextureView = depthTexture.createView();

  const { width, height } = canvas;
  camera = new PerspectiveCamera(
    45 * (Math.PI / 180),
    width / height,
    0.1,
    1000,
  );
  const r = 20;
  camera.setPosition([r, r, r]);
  camera.lookAt([0, 0, 0]);

  control = new OrbitalControl(camera, canvas, 135);

  drawAxis = new DrawAxis();
  terrain = new Terrain();

  initGui();

  if (isDev) {
    const { gui } = await import("./development/init-gui");
    const fLight = gui.addFolder("Lighting");
    fLight.add(terrain.lightDirection, "0", -1, 1).name("Dir X");
    fLight.add(terrain.lightDirection, "1", -1, 1).name("Dir Y");
    fLight.add(terrain.lightDirection, "2", -1, 1).name("Dir Z");
    fLight
      .addColor({ color: [1, 1, 1] }, "color")
      .onChange((v) => {
        terrain.lightColor[0] = v[0];
        terrain.lightColor[1] = v[1];
        terrain.lightColor[2] = v[2];
      })
      .name("Light Color");

    const fErosion = gui.addFolder("Erosion Settings");
    const actions = {
      reset: () => {
        terrain.reset();
      },
    };
    fErosion.add(actions, "reset").name("Reset Terrain");
    fErosion.add(terrain.erosionSettings, "showDrops").name("Show Drops");
    fErosion.add(terrain.erosionSettings, "iterations", 0, 50, 1).name("Pace");
    fErosion
      .add(terrain.erosionSettings, "inertia", 0.0, 1.0, 0.01)
      .name("Inertia");
    fErosion
      .add(terrain.erosionSettings, "gravity", 0.01, 2.0, 0.01)
      .name("Gravity");
    fErosion
      .add(terrain.erosionSettings, "capacity", 0.01, 2.0, 0.01)
      .name("Capacity");
    fErosion
      .add(terrain.erosionSettings, "evaporation", 0.001, 0.1, 0.001)
      .name("Evap.");
    fErosion
      .add(terrain.erosionSettings, "erosionRate", 0.001, 0.1, 0.001)
      .name("Erode Rate");
    fErosion
      .add(terrain.erosionSettings, "depositionRate", 0.001, 0.1, 0.001)
      .name("Deposit Rate");
  }

  addCapture();

  render();
}

function render() {
  control.update();
  terrain.update();

  const { device, context, format } = WebGPUContext;

  const commandEncoder = device.createCommandEncoder();
  const renderPassDescriptor = {
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        clearValue: {
          r: Config.background[0],
          g: Config.background[1],
          b: Config.background[2],
          a: 1.0,
        },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
    depthStencilAttachment: {
      view: depthTextureView,
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    },
  };

  const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
  drawAxis.draw(passEncoder, camera);
  terrain.draw(passEncoder, camera);
  passEncoder.end();

  device.queue.submit([commandEncoder.finish()]);

  requestAnimationFrame(render);
}

function initGui() {
  if (keepGui) {
    import("./development/init-gui");
  }
  if (isDev) {
    import("./development/stats");
  }
}
