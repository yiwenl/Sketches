import './style.css'
import { Renderer } from './core/renderer.js';
import { Camera } from './core/camera.js';
import { OrbitControls } from './core/controls.js';
import { ParticleSystem } from './particles/particle_system.js';
import { Constants } from './constants.js';
import { Config } from './config.js';
import { GUI } from './ui/gui.js';
import Stats from 'stats.js';
import { TextureDebug } from './helpers/texture_debug.js';
import { FluidSystem } from './fluid/fluid_system.js';
import { vec3 } from 'gl-matrix';
import { MathUtils } from './utils/math.js';
import { CameraHelper } from './helpers/camera_helper.js';
import { SphereHelper } from './helpers/sphere_helper.js';
import { Background } from './scene/background.js';
import { PulsingNumber } from './utils/pulsing-number.js';
import { FluidVisualizer } from './fluid/fluid_visualizer.js';
import { Floor } from './scene/floor.js';
import { PostProcess } from './scene/post_process.js';
import { Exporter } from './utils/exporter.js';
import { InteractionManager } from './core/interaction.js';
import { GPUUtils } from './core/gpu_utils.js';

const init = async () => {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas);

  // Setup Stats
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  stats.dom.style.display = Config.showDebug ? 'block' : 'none';

  // Setup GUI
  const gui = new GUI(stats);

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'd') {
      Config.showDebug = !Config.showDebug;
      gui.refresh();
      stats.dom.style.display = Config.showDebug ? 'block' : 'none';
    }
    if (e.key.toLowerCase() === 'f') {
      if (!document.fullscreenElement) {
        canvas.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
      } else {
        document.exitFullscreen();
      }
    }
    if (e.key.toLowerCase() === 's' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      Exporter.saveCanvas(canvas, `particles_${Date.now()}.jpg`);
    }
  });

  const renderer = new Renderer(canvas);
  await renderer.init();

  const camera = new Camera(45, canvas.width / canvas.height, 0.1, 1000);
  let d = Constants.useTargetDimension ? 25 : 20;
  camera.setPosition(d, d * .6, d);

  renderer.addResizeCallback((width, height) => {
    camera.setAspect(width / height);
    postProcess.updateBindGroup(renderer.sceneView);
  });

  const controls = new OrbitControls(camera, canvas);
  controls._phi.limit(0.01, Math.PI/2 - 0.01);
  controls.pan(30, 100)
  const interactionManager = new InteractionManager(canvas);

  // --- Systems Initialization ---
  const fluidSystem = new FluidSystem(renderer.device, Config.gridRes, Config.maxRadius);
  fluidSystem.config.velocityDecay = Config.velocityDecay;
  fluidSystem.config.pressureDecay = Config.pressureDecay;
  fluidSystem.config.densityDecay = Config.densityDecay;
  fluidSystem.config.vorticity = Config.vorticity;
  fluidSystem.config.forceStrength = Config.forceStrength;
  fluidSystem.config.pressureIterations = Config.pressureIterations;
  fluidSystem.enableRandomForce(true);

  const shadowDepthTexture = renderer.device.createTexture({
    size: [2048, 2048],
    format: 'depth32float',
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
  });
  const shadowView = shadowDepthTexture.createView();

  const colorMap1Texture = await GPUUtils.createTextureFromImage(renderer.device, Constants.colorMap1);
  const colorMap2Texture = await GPUUtils.createTextureFromImage(renderer.device, Constants.colorMap2);

  const particleSystem = new ParticleSystem(
    renderer.device, 
    renderer.format, 
    shadowDepthTexture,
    fluidSystem.velocities,
    fluidSystem.densities,
    colorMap1Texture,
    colorMap2Texture,
    Config.numParticles,
    {
      maxRadius: Config.maxRadius,
      sphereRadius: Config.sphereRadius,
      particleScale: Config.particleScale,
      noiseScale: Config.noiseScale,
      forceStrength: Config.forceStrength,
      speedScale: Config.speedScale,
      maxSpeed: Config.maxSpeed
    }
  );

  // --- Helpers ---
  const lightCamera = new Camera();
  lightCamera.setPerspective(33, 1, 25.5, 50);
  lightCamera.setPosition(20, 20, -20); 
  lightCamera.setTarget(0, -2, 0);
  lightCamera.setUp(0, 0, 1);
  
  const cameraHelper = new CameraHelper(renderer.device, renderer.format);
  const sphereHelper = new SphereHelper(renderer.device, renderer.format);
  const background = new Background(renderer.device, renderer.format);
  const fluidVisualizer = new FluidVisualizer(renderer.device, renderer.format, Config.gridRes, Config.maxRadius);
  fluidVisualizer.colorMode = 1; 

  const floor = new Floor(renderer.device, renderer.format, shadowDepthTexture);
  floor.updateBindGroup(particleSystem.lightGrid.texture, particleSystem.linearSampler);
  
  const postProcess = new PostProcess(renderer.device, renderer.format);
  postProcess.updateBindGroup(renderer.sceneView);

  const textureDebug = new TextureDebug(renderer.device, renderer.format);

  const maxSpeedPulse = new PulsingNumber(Config.maxSpeed, Config.maxSpeedPulseAmplitude, Config.maxSpeedPulseFrequency);

  const applyTornadoForces = (time) => {
    const radius = 4;
    const numForces = 8;
    const force = 60.0 / numForces;
    const dist = 3.5;
    const { random } = MathUtils;

    for(let i = 0; i < numForces; i++) {
      const _r = dist * random(0.8, 1.2);
      const v = vec3.fromValues(_r, -0.2, 0);
      const rot = i / numForces * Math.PI * 2 + time * 0.1 + random(1/numForces);
      let dirY = 0.5;
      const dir = vec3.fromValues(random(1, 2), dirY, random(0.5, 1));
      vec3.normalize(dir, dir);
      vec3.rotateY(v, v, [0, 0, 0], rot);
      vec3.rotateY(dir, dir, [0, 0, 0], rot + MathUtils.random(-1, 1) * 0.2);
      fluidSystem.addForce(v, dir, radius, force);
    }
  };
  let prevAutoPos = null;
  renderer.addUpdateCallback((deltaTime, totalTime) => {
    if (Config.showDebug) stats.begin(); 
    
    // Sync Config to Systems
    fluidSystem.config.velocityDecay = Config.velocityDecay;
    fluidSystem.config.pressureDecay = Config.pressureDecay;
    fluidSystem.config.densityDecay = Config.densityDecay;
    // Update pulsing speed
    maxSpeedPulse.base = Config.maxSpeed;
    maxSpeedPulse.amplitude = Config.maxSpeedPulseAmplitude;
    maxSpeedPulse.frequency = Config.maxSpeedPulseFrequency;
    const currentMaxSpeed = maxSpeedPulse.update(deltaTime);
    
    particleSystem.config.numParticles = Config.numParticles;
    particleSystem.config.sphereRadius = Config.sphereRadius;
    particleSystem.config.particleScale = Config.particleScale;
    particleSystem.config.noiseScale = Config.noiseScale;
    particleSystem.config.forceStrength = Config.forceStrength;
    particleSystem.config.speedScale = Config.speedScale;
    particleSystem.config.maxSpeed = currentMaxSpeed;
    particleSystem.config.glowIntensity = Config.glowIntensity;

    renderer.targetFPS = Config.targetFPS;
    floor.lightIntensity = Config.floorLightIntensity;

    controls.update();
    interactionManager.update(camera);
    
    // Add Mouse Interaction Force
    if (interactionManager.hitPoint && vec3.length(interactionManager.velocity) > 0.001) {
      
      const dir = vec3.clone(interactionManager.velocity);
      let f = vec3.length(dir);
      f = MathUtils.smoothstep(0, 1, f);
      const radius = MathUtils.mix(1.5, 3, f);
      const forceStrength = MathUtils.mix(1000, 2500, f);
      dir[1] += MathUtils.random(-1, 1) * 0.1;
      vec3.normalize(dir, dir); 

      const pos = vec3.clone(interactionManager.hitPoint);
      pos[1] += radius;  
      
      fluidSystem.addForce(
        pos,
        dir, 
        radius, 
        forceStrength
      );
    }

    // --- Autonomous "Dummy" Force (Infinity Sign) ---
    const tAuto = totalTime * Config.autoForceSpeed;
    const xAuto = Math.sin(tAuto) * Config.autoForceScale;
    const zAuto = Math.sin(tAuto * 2) * (Config.autoForceScale * 0.5);
    const currentAutoPos = vec3.fromValues(xAuto, Constants.floorY + 2.0, zAuto);

    if (prevAutoPos) {
      const autoVel = vec3.create();
      vec3.subtract(autoVel, currentAutoPos, prevAutoPos);
      
      if (vec3.length(autoVel) > 0.0001) {
        const autoDir = vec3.clone(autoVel);
        vec3.normalize(autoDir, autoDir);
        vec3.scale(autoDir, autoDir, -1);
        // Lighter force than mouse interaction
        const autoForceStrength = Config.autoForceIntensity * 2000; 
        const autoRadius = 2;

        fluidSystem.addForce(
          currentAutoPos,
          autoDir,
          autoRadius,
          autoForceStrength
        );
      }
    }
    prevAutoPos = currentAutoPos;

    applyTornadoForces(totalTime);
    fluidSystem.update(deltaTime, totalTime);
    particleSystem.update(
      deltaTime, 
      totalTime, 
      fluidSystem.velocities, 
      fluidSystem.densities, 
      fluidSystem.vIn, 
      fluidSystem.dIn
    );

    // Shadow Pass
    const shadowEncoder = renderer.device.createCommandEncoder();
    const shadowPass = shadowEncoder.beginRenderPass({
      colorAttachments: [],
      depthStencilAttachment: {
        view: shadowView,
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      }
    });
    particleSystem.renderShadow(shadowPass, lightCamera);
    shadowPass.end();
    renderer.device.queue.submit([shadowEncoder.finish()]);

    if (Config.showDebug) stats.update(); 
  });

  renderer.addRenderCallback((pass, deltaTime, totalTime) => {
    background.render(pass, canvas.width, canvas.height, totalTime);
    
    if (Config.showDebug) {
      cameraHelper.render(pass, camera, lightCamera);
      sphereHelper.render(pass, camera, lightCamera.position, 0.5, [1, 1, 0, 1]);
      
      if (interactionManager.hitPoint) {
        sphereHelper.render(pass, camera, interactionManager.hitPoint, 0.3, [1, 0, 0, 1]);
      }

      fluidVisualizer.render(pass, camera, fluidSystem);
    }

    particleSystem.render(pass, camera, lightCamera);
    floor.render(pass, camera, lightCamera, particleSystem.config.maxRadius);
    
    if (Config.showDebug) {
      const size = 200;
      const y = canvas.height - size - 10;
      textureDebug.render(pass, shadowView, 10, y, size, size);
    }
  });

  renderer.addPostRenderCallback((pass, deltaTime, totalTime) => {
    const aspect = canvas.width / canvas.height;
    postProcess.render(pass, totalTime, Config.filmGrainIntensity, Config.vignetteIntensity, aspect);
  });

  renderer.start();
};

init().catch(console.error);
