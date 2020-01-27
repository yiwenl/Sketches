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
    gui.add(Config, 'numParticles', 10, 1024).step(1).onFinishChange(Settings.reload)
    gui.add(Config, 'numSets', 1, 10).step(1).onFinishChange(Settings.reload)
    gui.add(Config, 'yRange', 5, 20).step(1).onFinishChange(Settings.refresh)
    gui.add(Config, 'maxRadius', 1, 5).onFinishChange(Settings.refresh)
    gui.add(Config, 'background', 0, 1).onFinishChange(Settings.refresh)
    gui.add(Config, 'shadowStrength', 0, 1).onFinishChange(Settings.refresh)
    gui.add(Config, 'maskScale', 1, 4).onFinishChange(Settings.refresh)
    gui.add(oControl, 'save').name('Save Settings')
    gui.add(Settings, 'reset').name('Reset Default')
  }, 500)
}

export default addControls
