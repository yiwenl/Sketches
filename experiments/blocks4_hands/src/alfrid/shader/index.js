import fsSimpleColor from "./glsl/simpleColor.frag";
import fsCopy from "./glsl/copy.frag";
import vsGeneral from "./glsl/general.vert";
import vsTriangle from "./glsl/bigTriangle.vert";
import vsSkybox from "./glsl/skybox.vert";

const ShaderLibs = {
  simpleColorFrag: fsSimpleColor,
  copyFrag: fsCopy,
  bigTriangleVert: vsTriangle,
  generalVert: vsGeneral,
  skyboxVert: vsSkybox,
};

export { ShaderLibs };
