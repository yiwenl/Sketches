import { WebGLConst } from "./WebGLConst";
import { WebGLNumber } from "./WebGLNumber";

const exposeGLProperties = (GL) => {
  // console.log(GL);
  for (const s in WebGLConst) {
    if (!GL[s]) {
      GL[s] = WebGLConst[s];
    } else {
      // if (s !== "FLOAT") console.log("already exist : ", s);
      console.log("already exist : ", s);
    }
  }

  if (GL.webgl2) {
    const check = /^[^a-z]*$/;
    for (const s in GL.gl) {
      if (check.test(s) && s.indexOf("FLOAT") === -1) {
        GL[s] = GL.gl[s];
        WebGLConst[s] = GL.gl[s];
        WebGLNumber[GL[s]] = s;
      }
    }
  }
};

export default exposeGLProperties;
