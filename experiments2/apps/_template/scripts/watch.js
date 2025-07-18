// watch.js

import { watch } from 'chokidar';
import { EventEmitter } from 'events';

const ignores = [
  'node_modules/**',
  '.git',
  '.DS_Store',
]

export default function(blob,opt) {

  opt = Object.assign({
    ignored: ignores,
    ignoreInitial: true
  }, opt);

  const emitter = new EventEmitter();
  const watcher = watch(blob,opt);
  watcher.on('all',(event, path) => {
    emitter.emit('all', event, path)
  });
  return emitter;

}
