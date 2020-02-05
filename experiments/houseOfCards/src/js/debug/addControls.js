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
    gui.add(Config, 'numberOfCards', 1, 500).step(1).onFinishChange(Settings.reload)
    gui.add(Config, 'speed', 0, 1).onFinishChange(Settings.refresh)
    gui.add(oControl, 'save').name('Save Settings')
    gui.add(Settings, 'reset').name('Reset Default')
  }, 200)
}

export default addControls
