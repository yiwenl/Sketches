import { Pane } from 'tweakpane';
import { Config } from '../config.js';

export class GUI {
  constructor(stats) {
    this.stats = stats;
    this.pane = new Pane();
    this.pane.containerElem_.style.zIndex = '1000';
    
    this.init();
    this.setupEvents();
  }

  init() {
    const fParticles = this.pane.addFolder({ title: 'Particles' });
    fParticles.addBinding(Config, 'particleScale', { min: 0.1, max: 0.5 });
    fParticles.addBinding(Config, 'noiseScale', { min: 0, max: 2 });
    fParticles.addBinding(Config, 'speedScale', { min: 0, max: 2, step: 0.01 });
    fParticles.addBinding(Config, 'maxSpeed', { min: 0, max: 2, step: 0.01 });
    fParticles.addBinding(Config, 'maxSpeedPulseAmplitude', { min: 0, max: 1, step: 0.01, label: 'Pulse Amp' });
    fParticles.addBinding(Config, 'maxSpeedPulseFrequency', { min: 0, max: 10, step: 0.1, label: 'Pulse Freq' });
    fParticles.addBinding(Config, 'glowIntensity', { min: 0, max: 0.001, step: 0.0001 });
    fParticles.addBinding(Config, 'sphereRadius', { min: 1, max: 10 });

    const fFluid = this.pane.addFolder({ title: 'Fluid Simulation' });
    fFluid.addBinding(Config, 'velocityDecay', { min: 0.8, max: 1.0 });
    fFluid.addBinding(Config, 'pressureDecay', { min: 0.8, max: 1.0 });
    fFluid.addBinding(Config, 'densityDecay', { min: 0.8, max: 1.0 });
    fFluid.addBinding(Config, 'vorticity', { min: 0, max: 10 });
    fFluid.addBinding(Config, 'pressureIterations', { min: 1, max: 100, step: 1 });

    const fAuto = this.pane.addFolder({ title: 'Auto Force' });
    fAuto.addBinding(Config, 'autoForceIntensity', { min: 0, max: 2, label: 'Intensity' });
    fAuto.addBinding(Config, 'autoForceSpeed', { min: 0, max: 2, label: 'Speed' });
    fAuto.addBinding(Config, 'autoForceScale', { min: 0, max: 10, label: 'Scale' });

    const fGeneral = this.pane.addFolder({ title: 'General' });
    fGeneral.addBinding(Config, 'targetFPS', { min: 0, max: 120, step: 1, label: 'Target FPS (0=max)' });
    fGeneral.addBinding(Config, 'filmGrainIntensity', { min: 0, max: 0.2, step: 0.01, label: 'Film Grain' });
    fGeneral.addBinding(Config, 'vignetteIntensity', { min: 0, max: 1.0, step: 0.01, label: 'Vignette' });
    fGeneral.addBinding(Config, 'showDebug').on('change', (ev) => {
      if (this.stats) {
        this.stats.dom.style.display = ev.value ? 'block' : 'none';
      }
    });

    // Hidden by default if needed, or based on Config
    if (this.stats) {
      this.stats.dom.style.display = Config.showDebug ? 'block' : 'none';
    }
  }

  setupEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'h') {
        this.pane.hidden = !this.pane.hidden;
      }
    });
  }

  get hidden() {
    return this.pane.hidden;
  }

  set hidden(value) {
    this.pane.hidden = value;
  }

  refresh() {
    this.pane.refresh();
  }
}
