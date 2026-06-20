import type FluidSimulation from "@fluid-sim";
import Stats from "stats.js";
import { Pane } from "tweakpane";
import * as TweakpaneEssentialsPlugin from "@tweakpane/plugin-essentials";
import Config from "./Config";
import Settings from "./Settings";
import { toggleUI } from "./ui";

export interface DevelopmentOverlayOptions {
  fluid: FluidSimulation;
}

export class DevelopmentOverlay {
  private readonly stats: Stats;
  private readonly pane: Pane;
  private visible = true;
  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() !== "h" || isEditableTarget(event.target)) {
      return;
    }
    this.setVisible(!this.visible);
  };

  constructor({ fluid }: DevelopmentOverlayOptions) {
    this.stats = new Stats();
    this.stats.showPanel(0);
    this.stats.dom.classList.add("stats-panel");
    document.body.appendChild(this.stats.dom);

    this.pane = new Pane({ title: "Fluid Particles" });
    this.pane.registerPlugin(TweakpaneEssentialsPlugin);
    this.initGui(fluid);
    window.addEventListener("keydown", this.handleKeyDown);
  }

  begin(): void {
    this.stats.begin();
  }

  end(): void {
    this.stats.end();
  }

  destroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    this.pane.dispose();
    this.stats.dom.remove();
  }

  private setVisible(visible: boolean): void {
    this.visible = visible;
    this.pane.hidden = !visible;
    this.stats.dom.classList.toggle("overlay-hidden", !visible);
  }

  private initGui(fluid: FluidSimulation): void {
    const pane = this.pane;
    const params = Config;

    const folderSimulation = pane.addFolder({ title: "Fluid Simulation" });
    const folderInteraction = pane.addFolder({ title: "Interaction & Forces" });
    const folderLooks = pane.addFolder({ title: "Lighting & Looks" });
    const folderDebug = pane.addFolder({
      title: "Debug Overlays",
      expanded: false,
    });

    folderSimulation
      .addBinding(params, "fluidTextureSize", {
        label: "Fluid texture size",
        options: {
          128: 128,
          256: 256,
        },
      })
      .on("change", () => Settings.reload());

    folderSimulation
      .addBinding(params, "speedMultiplier", {
        label: "Speed multiplier",
        min: 0.1,
        max: 1.0,
        step: 0.01,
      })
      .on("change", () => Settings.refresh());

    folderSimulation
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

    folderSimulation
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

    folderSimulation
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

    folderSimulation
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

    folderSimulation
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

    folderInteraction
      .addBinding(params, "strength", {
        label: "Force strength",
        min: 100,
        max: 500,
      })
      .on("change", () => Settings.refresh());

    folderInteraction
      .addBinding(params, "radius", {
        label: "Force radius",
        min: 0.01,
        max: 0.1,
      })
      .on("change", () => Settings.refresh());

    folderInteraction
      .addBinding(params, "noiseStrength", {
        label: "Force noise",
        min: 0,
        max: 1,
        step: 0.01,
      })
      .on("change", () => Settings.refresh());

    folderLooks
      .addBinding(params, "lightIntensity", {
        label: "Light Intensity",
        min: 0.0,
        max: 3.0,
      })
      .on("change", () => Settings.refresh());

    folderLooks
      .addBinding(params, "shadowStrength", {
        label: "Shadow Strength",
        min: 0.0,
        max: 1.0,
      })
      .on("change", () => Settings.refresh());

    pane.addButton({ title: "Toggle Composer UI" }).on("click", () => {
      toggleUI();
    });

    folderDebug
      .addBinding(params, "showFluidSlice", { label: "Show fluid slice" })
      .on("change", () => Settings.refresh());
    folderDebug
      .addBinding(params, "showSliceVelocity", { label: "Slice velocity" })
      .on("change", () => Settings.refresh());
    folderDebug
      .addBinding(params, "showSliceDensity", { label: "Slice density" })
      .on("change", () => Settings.refresh());

    pane.addButton({ title: "Restore default settings" }).on("click", () => {
      window.location.href = window.location.pathname;
    });

    pane
      .addButton({ title: "Download current settings" })
      .on("click", () => downloadCurrentSettings());
  }
}

function downloadCurrentSettings(): void {
  const json = JSON.stringify(Config, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `fluid-particles-settings-${formatTimestamp(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatTimestamp(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("-");
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tagName = target.tagName.toLowerCase();
  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
}
