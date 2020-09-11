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
    const mapSizes = [Math.pow(2, 8), Math.pow(2, 9), Math.pow(2, 10), Math.pow(2, 11), Math.pow(2, 12)]
    gui.add(Config, 'planeSize', 1, 5).step(1).onFinishChange(Settings.reload)
    gui.add(Config, 'simulationSize', mapSizes).onFinishChange(Settings.reload)
    gui.add(oControl, 'save').name('Save Settings')
    gui.add(Settings, 'reset').name('Reset Default')
  }, 200)
}

export default addControls
