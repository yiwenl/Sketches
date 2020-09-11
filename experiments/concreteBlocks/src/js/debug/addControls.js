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

    gui.add(oControl, 'save').name('Save Settings')
    gui.add(Settings, 'reset').name('Reset Default')
  }, 200)
}

export default addControls
