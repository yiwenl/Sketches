'use strict';

var BufferSource = require('./source/buffer-source.js'),
    Effect = require('./effect.js'),
    Emitter = require('./utils/emitter.js'),
    file = require('./utils/file.js'),
    Loader = require('./utils/loader.js'),
    MediaSource = require('./source/media-source.js'),
    MicrophoneSource = require('./source/microphone-source.js'),
    OscillatorSource = require('./source/oscillator-source.js'),
    ScriptSource = require('./source/script-source.js'),
    waveform = require('./utils/waveform.js')();

function Sound(context, destination) {
    var id,
        data,
        effect = new Effect(context),
        gain = effect.gain(),
        isTouchLocked = false,
        loader,
        loop = false,
        playbackRate = 1,
        playWhenReady,
        source,
        sound;

    if(context) {
        effect.setDestination(gain);
        gain.connect(destination || context.destination);
    }

    /*
     * Load
     */

    var load = function(config) {
        var src = file.getSupportedFile(config.src || config.url || config);

        if(source && data && data.tagName) {
            source.load(src);
        }
        else {
            loader = loader || new Loader(src);
            loader.audioContext = !!config.asMediaElement ? null : context;
            loader.isTouchLocked = isTouchLocked;
            loader.once('loaded', function(file) {
                createSource(file);
                sound.emit('loaded', sound);
            });
        }
        return sound;
    };

    /*
     * Controls
     */

    var play = function(delay, offset) {
        if(!source || isTouchLocked) {
            playWhenReady = function() {
                if (source) {
                    play(delay, offset);
                }
            };
            return sound;
        }
        playWhenReady = null;
        effect.setSource(source.sourceNode);

        // update volume needed for no webaudio
        if(!context) { sound.volume = gain.gain.value; }

        source.play(delay, offset);

        if(source.hasOwnProperty('loop')) {
            source.loop = loop;
        }

        sound.emit('play', sound);

        return sound;
    };

    var pause = function() {
        source && source.pause();
        sound.emit('pause', sound);
        return sound;
    };

    var stop = function(delay) {
        source && source.stop(delay || 0);
        sound.emit('stop', sound);
        return sound;
    };

    var seek = function(percent) {
        if(source) {
            source.stop();
            play(0, source.duration * percent);
        }
        return sound;
    };

    var fade = function(volume, duration) {
        if(!source) { return sound; }

        var param = gain.gain;

        if(context) {
            var time = context.currentTime;
            param.cancelScheduledValues(time);
            param.setValueAtTime(param.value, time);
            param.linearRampToValueAtTime(volume, time + duration);
        }
        else if(typeof source.fade === 'function') {
            source.fade(volume, duration);
            param.value = volume;
        }

        return sound;
    };

    /*
     * Destroy
     */

    var destroy = function() {
        source && source.destroy();
        effect && effect.destroy();
        gain && gain.disconnect();
        loader && loader.destroy();
        sound.off('loaded');
        sound.off('ended');
        gain = null;
        context = null;
        data = null;
        playWhenReady = null;
        source = null;
        effect = null;
        loader = null;
        sound.emit('destroy', sound);
        sound.off('destroy');
    };

    /*
     * Create source
     */

    var createSource = function(value) {
        data = value;

        if(file.isAudioBuffer(data)) {
            source = new BufferSource(data, context, function() {
                sound.emit('ended', sound);
            });
        }
        else if(file.isMediaElement(data)) {
            source = new MediaSource(data, context, function() {
                sound.emit('ended', sound);
            });
        }
        else if(file.isMediaStream(data)) {
            source = new MicrophoneSource(data, context);
        }
        else if(file.isOscillatorType((data && data.type) || data)) {
            source = new OscillatorSource(data.type || data, context);
        }
        else if(file.isScriptConfig(data)) {
            source = new ScriptSource(data, context);
        }
        else {
            throw new Error('Cannot detect data type: ' + data);
        }

        effect.setSource(source.sourceNode);

        sound.emit('ready', sound);

        if(playWhenReady) {
            playWhenReady();
        }
    };

    sound = Object.create(Emitter.prototype, {
        _events: {
            value: {}
        },
        constructor: {
            value: Sound
        },
        play: {
            value: play
        },
        pause: {
            value: pause
        },
        load: {
            value: load
        },
        seek: {
            value: seek
        },
        stop: {
            value: stop
        },
        fade: {
            value: fade
        },
        destroy: {
            value: destroy
        },
        context: {
            value: context
        },
        currentTime: {
            get: function() {
                return source ? source.currentTime : 0;
            },
            set: function(value) {
                // var silent = sound.playing;
                source && source.stop();
                // play(0, value, silent);
                play(0, value);
            }
        },
        data: {
            get: function() {
                return data;
            },
            set : function(value) {
                if(!value) { return; }
                createSource(value);
            }
        },
        duration: {
            get: function() {
                return source ? source.duration : 0;
            }
        },
        effect: {
            value: effect
        },
        ended: {
            get: function() {
                return !!source && source.ended;
            }
        },
        frequency: {
            get: function() {
                return source ? source.frequency : 0;
            },
            set: function(value) {
                if(source && source.hasOwnProperty('frequency')) {
                    source.frequency = value;
                }
            }
        },
        gain: {
            value: gain
        },
        id: {
            get: function() {
                return id;
            },
            set: function(value) {
                id = value;
            }
        },
        isTouchLocked: {
            set: function(value) {
                isTouchLocked = value;
                if(loader) {
                    loader.isTouchLocked = value;
                }
                if(!value && playWhenReady) {
                    playWhenReady();
                }
            }
        },
        loader: {
            get: function() {
                return loader;
            }
        },
        loop: {
            get: function() {
                return loop;
            },
            set: function(value) {
                loop = !!value;

                if(source && source.hasOwnProperty('loop') && source.loop !== loop) {
                  source.loop = loop;
                }
            }
        },
        paused: {
            get: function() {
                return !!source && source.paused;
            }
        },
        playing: {
            get: function() {
                return !!source && source.playing;
            }
        },
        playbackRate: {
            get: function() {
                return playbackRate;
            },
            set: function(value) {
                playbackRate = value;
                if(source) {
                  source.playbackRate = playbackRate;
                }
            }
        },
        progress: {
            get: function() {
                return source ? source.progress : 0;
            }
        },
        volume: {
            get: function() {
                if(context) {
                    return gain.gain.value;
                }
                if(source && source.hasOwnProperty('volume')) {
                    return source.volume;
                }
                return 1;
            },
            set: function(value) {
                if(isNaN(value)) { return; }

                var param = gain.gain;

                if(context) {
                    var time = context.currentTime;
                    param.cancelScheduledValues(time);
                    param.value = value;
                    param.setValueAtTime(value, time);
                }
                else {
                    param.value = value;

                    if(source && source.hasOwnProperty('volume')) {
                        source.volume = value;
                    }
                }
            }
        },
        // for media element source
        groupVolume: {
            get: function() {
                return source.groupVolume;
            },
            set: function(value) {
                if(source && source.hasOwnProperty('groupVolume')) {
                    source.groupVolume = value;
                }
            }
        },
        waveform: {
            value: function(length) {
                if(!data) {
                    sound.once('ready', function() {
                        waveform(data, length);
                    });
                }
                return waveform(data, length);
            }
        },
        userData: {
            value: {}
        }
    });

    return Object.freeze(sound);
}

module.exports = Sound;
