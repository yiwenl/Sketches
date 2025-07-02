// watch.js

const watch = require('chokidar').watch;
const Emitter = require('events');

const ignores = [
  'node_modules/**',
  'bower_components/**',
  '.git',
  '.DS_Store',
]

module.exports = function(blob,opt) {

  opt = Object.assign({
    ignored: ignores,
    ignoreInitial: true
  }, opt);

  const emitter = new Emitter();
  const watcher = watch(blob,opt);
  watcher.on('all',(event, path) => {
    emitter.emit('all', event, path)
  });
  return emitter;

}
