import { Draw, Geom, ShaderLibs } from "@alfrid";
import MapConstants from "./MapConstants";
import Config from "./Config";
import fs from "./shaders/sim.frag";

export default class DrawSim extends Draw {
  constructor() {
    super();

    this.setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 1)
      .uniform("uMapSize", MapConstants.MAP_SIZE)
      .uniform("uInitialWater", 1)
      .uniform("uSedimentCapacity", Config.sedimentCapacity)
      .uniform("uDepositionRate", MapConstants.DEPOSITION_RATE)
      .uniform("uMinVolume", MapConstants.MIN_VOLUME)
      .uniform("uEvaporationRate", MapConstants.EVAPORATION_RATE)
      .uniform("uGravity", MapConstants.GRAVITY);
  }
}
