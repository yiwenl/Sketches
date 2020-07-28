// addControls.js

import Settings from '../Settings'
import Config from '../Config'
import { saveJson } from '../utils'

const addControls = (scene) => {
  const oControl = {
    save: () => {
      saveJson(Config, 'Settings')
    }
  }

  setTimeout(() => {
    gui.add(Config, 'roughness', 0, 1).onFinishChange(Settings.refresh)
    gui.add(Config, 'metallic', 0, 1).onFinishChange(Settings.refresh)
    gui.add(Config, 'normalScale', 0, 10).onFinishChange(Settings.refresh)
    gui.add(Config, 'uvScale', 0.01, 1).onFinishChange(Settings.refresh)
    gui.add(Config, 'exposure', 0.1, 4).onFinishChange(Settings.refresh)
    gui.add(Config, 'envRx', -Math.PI, Math.PI).onFinishChange(Settings.refresh)
    gui.add(Config, 'envRy', -Math.PI, Math.PI).onFinishChange(Settings.refresh)
    gui.add(Config, 'shadowStrength', 0, 1).onFinishChange(Settings.refresh)

    const envs = ['skyfire', 'street0', 'street1', 'studio']
    gui.add(Config, 'env', envs).onFinishChange(Settings.refresh)

    const textures = ['concrete_dirty_01', 'concrete_rough_03', 'stucco_brushed_01', 'stucco_wall_01', 'stucco_brushed_01']
    gui.add(Config, 'texture', textures).onFinishChange(Settings.refresh)

    gui.add(oControl, 'save').name('Save Settings')
    gui.add(Settings, 'reset').name('Reset Default')
  }, 200)
}

export default addControls
