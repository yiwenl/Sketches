'use strict';

var browser = require('./lib/utils/browser.js'),
    file = require('./lib/utils/file.js'),
    Group = require('./lib/group.js'),
    Loader = require('./lib/utils/loader.js'),
    Sound = require('./lib/sound.js'),
    SoundGroup = require('./lib/utils/sound-group.js'),
    utils = require('./lib/utils/utils.js');

function Sono() {
    var VERSION = '0.0.9',
        Ctx = (window.AudioContext || window.webkitAudioContext),
        context = (Ctx ? new Ctx() : null),
        destination = (context ? context.destination : null),
        group = new Group(context, destination),
        api;

    utils.setContext(context);

    /*
     * Create Sound
     *
     * Accepted values for param config:
     * Object config e.g. { id:'foo', url:['foo.ogg', 'foo.mp3'] }
     * Array (of files e.g. ['foo.ogg', 'foo.mp3'])
     * ArrayBuffer
     * HTMLMediaElement
     * Filename string (e.g. 'foo.ogg')
     * Oscillator type string (i.e. 'sine', 'square', 'sawtooth', 'triangle')
     * ScriptProcessor config object (e.g. { bufferSize: 1024, channels: 1, callback: fn })
     */

    var createSound = function(config) {
        // try to load if config contains URLs
        if(file.containsURL(config)) {
            return load(config);
        }

        var sound = add(config);
        sound.data = config.data || config;

        return sound;
    };

    /*
     * Destroy
     */

    var destroySound = function(soundOrId) {
        group.find(soundOrId, function(sound) {
            sound.destroy();
        });
        return api;
    };

    var destroyAll = function() {
        group.destroy();
        return api;
    };

    /*
     * Get Sound by id
     */

    var getSound = function(id) {
        return group.find(id);
    };

    /*
     * Create group
     */

    var createGroup = function(sounds) {
        var soundGroup = new SoundGroup(context, group.gain);
        if(sounds) {
            sounds.forEach(function(sound) {
                soundGroup.add(sound);
            });
        }
        return soundGroup;
    };

    /*
     * Loading
     */

    var load = function(config) {
        var src = config.src || config.url || config,
            sound, loader;

        if(file.containsURL(src)) {
            sound = queue(config);
            loader = sound.loader;
        } else if(Array.isArray(src) && file.containsURL(src[0].src || src[0].url)) {
            sound = [];
            loader = new Loader.Group();
            src.forEach(function(file) {
                sound.push(queue(file, loader));
            });
        } else {
            var errorMessage = 'sono.load: No audio file URLs found in config.';
            if (config.onError) {
              config.onError('[ERROR] ' + errorMessage);
            } else {
              throw new Error(errorMessage);
            }
            return null;
        }
        if (config.onProgress) {
            loader.on('progress', function(progress) {
                config.onProgress(progress);
            });
        }
        if (config.onComplete) {
            loader.once('complete', function() {
                loader.off('progress');
                config.onComplete(sound);
            });
        }
        loader.once('error', function(err) {
            loader.off('error');
            if (config.onError) {
                config.onError(err);
            } else {
                console.error.call(console, '[ERROR] sono.load: ' + err);
            }
        });
        loader.start();

        return sound;
    };

    var queue = function(config, loaderGroup) {
        var sound = add(config).load(config);

        if(loaderGroup) {
            loaderGroup.add(sound.loader);
        }
        return sound;
    };

    var add = function(config) {
        var soundContext = config && config.webAudio === false ? null : context;
        var sound = new Sound(soundContext, group.gain);
        sound.isTouchLocked = isTouchLocked;
        if(config) {
            sound.id = config.id || '';
            sound.loop = !!config.loop;
            sound.volume = config.volume;
        }
        group.add(sound);
        return sound;
    };

    /*
     * Controls
     */

    var mute = function() {
        group.mute();
        return api;
    };

    var unMute = function() {
        group.unMute();
        return api;
    };

    var fade = function(volume, duration) {
        group.fade(volume, duration);
        return api;
    };

    var pauseAll = function() {
        group.pause();
        return api;
    };

    var resumeAll = function() {
        group.resume();
        return api;
    };

    var stopAll = function() {
        group.stop();
        return api;
    };

    var play = function(id, delay, offset) {
        group.find(id, function(sound) {
            sound.play(delay, offset);
        });
        return api;
    };

    var pause = function(id) {
        group.find(id, function(sound) {
            sound.pause();
        });
        return api;
    };

    var stop = function(id) {
        group.find(id, function(sound) {
            sound.stop();
        });
        return api;
    };

    /*
     * Mobile touch lock
     */

    var isTouchLocked = browser.handleTouchLock(context, function() {
        isTouchLocked = false;
        group.sounds.forEach(function(sound) {
            sound.isTouchLocked = false;
        });
    });

    /*
     * Page visibility events
     */

    (function() {
        var pageHiddenPaused = [];

        // pause currently playing sounds and store refs
        function onHidden() {
            group.sounds.forEach(function(sound) {
                if(sound.playing) {
                    sound.pause();
                    pageHiddenPaused.push(sound);
                }
            });
        }

        // play sounds that got paused when page was hidden
        function onShown() {
            while(pageHiddenPaused.length) {
                pageHiddenPaused.pop().play();
            }
        }

        browser.handlePageVisibility(onHidden, onShown);
    }());

    /*
     * Log version & device support info
     */

    var log = function() {
        var title = 'sono ' + VERSION,
            info = 'Supported:' + api.isSupported +
                   ' WebAudioAPI:' + api.hasWebAudio +
                   ' TouchLocked:' + isTouchLocked +
                   ' Extensions:' + file.extensions;

        if(navigator.userAgent.indexOf('Chrome') > -1) {
            var args = [
                    '%c ♫ ' + title +
                    ' ♫ %c ' + info + ' ',
                    'color: #FFFFFF; background: #379F7A',
                    'color: #1F1C0D; background: #E0FBAC'
                ];
            console.log.apply(console, args);
        }
        else if (window.console && window.console.log.call) {
            console.log.call(console, title + ' ' + info);
        }
    };

    api = {
        createSound: createSound,
        destroySound: destroySound,
        destroyAll: destroyAll,
        getSound: getSound,
        createGroup: createGroup,
        load: load,
        mute: mute,
        unMute: unMute,
        fade: fade,
        pauseAll: pauseAll,
        resumeAll: resumeAll,
        stopAll: stopAll,
        play: play,
        pause: pause,
        stop: stop,
        log: log,

        canPlay: file.canPlay,
        context: context,
        effect: group.effect,
        extensions: file.extensions,
        hasWebAudio: !!context,
        isSupported: file.extensions.length > 0,
        gain: group.gain,
        utils: utils,
        VERSION: VERSION
    };

    /*
     * Getters & Setters
     */

    Object.defineProperties(api, {
        isTouchLocked: {
            get: function() {
                return isTouchLocked;
            }
        },
        sounds: {
            get: function() {
                return group.sounds.slice(0);
            }
        },
        volume: {
            get: function() {
                return group.volume;
            },
            set: function(value) {
                group.volume = value;
            }
        }
    });

    return Object.freeze(api);
}

module.exports = new Sono();
