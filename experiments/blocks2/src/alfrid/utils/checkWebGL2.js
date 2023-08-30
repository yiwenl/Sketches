const checkWebGL2 = () => {
  const canvas = document.createElement("canvas");
  const ctx =
    canvas.getContext("experimental-webgl2") || canvas.getContext("webgl2");
  return !!ctx;
};

export { checkWebGL2 };
