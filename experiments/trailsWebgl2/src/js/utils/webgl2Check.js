let hasWebGL2;

const webgl2Check = () => {
  if (hasWebGL2 === undefined) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("webgl2");
    hasWebGL2 = !!ctx;
  }
  return hasWebGL2;
};

export default webgl2Check;
