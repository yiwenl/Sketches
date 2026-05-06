const shaders = import.meta.glob('../**/*.wgsl', { query: '?raw', import: 'default', eager: true });

export function processShader(source) {
  return source.replace(/#include "(.+)"/g, (match, includeName) => {
    // Look for key ending with includeName
    const key = Object.keys(shaders).find(k => k.endsWith(`/${includeName}`));
    
    if (key && shaders[key]) {
      return shaders[key];
    }
    
    console.warn(`Shader include not found: ${includeName}`);
    return match;
  });
}
