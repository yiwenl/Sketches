import type FluidSimulation from "@fluid-sim-belfast";
import Stats from "stats.js";
import { Pane } from "tweakpane";
import Config from "./Config";
import Settings from "./Settings";

export interface DevelopmentOverlayOptions {
  fluid: FluidSimulation;
  maxRadius: number;
}

export class DevelopmentOverlay {
  private readonly stats: Stats;
  private readonly pane: Pane;

  constructor({ fluid, maxRadius }: DevelopmentOverlayOptions) {
    this.stats = new Stats();
    this.stats.showPanel(0);
    this.stats.dom.classList.add("stats-panel");
    document.body.appendChild(this.stats.dom);

    this.pane = new Pane({ title: "Fluid Particles" });
    this.initGui(fluid, maxRadius);
  }

  begin(): void {
    this.stats.begin();
  }

  end(): void {
    this.stats.end();
  }

  destroy(): void {
    this.pane.dispose();
    this.stats.dom.remove();
  }

  private initGui(fluid: FluidSimulation, maxRadius: number): void {
    const pane = this.pane;
    const params = Config;

    pane
      .addBinding(params, "fluidTextureSize", {
        label: "Fluid texture size",
        options: {
          32: 32,
          64: 64,
        },
      })
      .on("change", () => Settings.reload());
    pane
      .addBinding(params, "strength", {
        label: "Force strength",
        min: 10,
        max: 200,
      })
      .on("change", () => Settings.refresh());
    pane
      .addBinding(params, "radius", {
        label: "Force radius",
        min: 0.2 * maxRadius,
        max: 0.8 * maxRadius,
      })
      .on("change", () => Settings.refresh());
    pane
      .addBinding(params, "advectionScale", {
        label: "Advection scale",
        min: 1,
        max: 64,
        step: 1,
      })
      .on("change", (event) => {
        fluid.settings.ADVECTION_SCALE = event.value;
        Settings.refresh();
      });
    pane
      .addBinding(params, "noiseStrength", {
        label: "Force noise",
        min: 0,
        max: 1,
        step: 0.01,
      })
      .on("change", () => Settings.refresh());
    pane
      .addBinding(params, "curl", {
        label: "Curl (vorticity)",
        min: 0,
        max: 60,
        step: 1,
      })
      .on("change", (event) => {
        fluid.settings.CURL = event.value;
        Settings.refresh();
      });
    pane
      .addBinding(params, "densityDissipation", {
        label: "Density decay",
        min: 0.9,
        max: 1.0,
        step: 0.001,
      })
      .on("change", (event) => {
        fluid.settings.DENSITY_DISSIPATION = event.value;
        Settings.refresh();
      });
    pane
      .addBinding(params, "velocityDissipation", {
        label: "Velocity decay",
        min: 0.9,
        max: 1.0,
        step: 0.001,
      })
      .on("change", (event) => {
        fluid.settings.VELOCITY_DISSIPATION = event.value;
        Settings.refresh();
      });
    pane
      .addBinding(params, "pressureIterations", {
        label: "Pressure iters",
        min: 1,
        max: 40,
        step: 1,
      })
      .on("change", (event) => {
        fluid.settings.PRESSURE_ITERATIONS = event.value;
        Settings.refresh();
      });
    pane
      .addBinding(params, "showFluidSlice", { label: "Show fluid slice" })
      .on("change", () => Settings.refresh());
    pane
      .addBinding(params, "showSliceVelocity", { label: "Slice velocity" })
      .on("change", () => Settings.refresh());
    pane
      .addBinding(params, "showSliceDensity", { label: "Slice density" })
      .on("change", () => Settings.refresh());
  }
}
