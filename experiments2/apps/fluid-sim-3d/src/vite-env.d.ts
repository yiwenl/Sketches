/// <reference types="vite/client" />

declare module "*.wgsl?raw" {
  const content: string;
  export default content;
}
