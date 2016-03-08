'use strict';

var Effect = require('./effect.js');

function Group(context, destination) {
    var sounds = [],
        effect = new Effect(context),
        gain = effect.gain(),
        preMuteVolume = 1,
        group;

    if(context) {
        effect.setSource(gain);
        effect.setDestination(destination || context.destination);
    }

    /*
     * Add / remove
     */

    var add = function(sound) {
        sound.gain.disconnect();
        sound.gain.connect(gain);

        sounds.push(sound);

        sound.once('destroy', remove);

        return group;
    };

    var find = function(soundOrId, callback) {
        var found;

        if(!soundOrId && soundOrId !== 0) {
            return found;
        }

        sounds.some(function(sound) {
            if(sound === soundOrId || sound.id === soundOrId) {
                found = sound;
                return true;
            }
        });

        if(found && callback) {
            callback(found);
        }

        return found;
    };

    var remove = function(soundOrId) {
        find(soundOrId, function(sound) {
            sounds.splice(sounds.indexOf(sound), 1);
        });
        return group;
    };

    /*
     * Controls
     */

    var play = function(delay, offset) {
        sounds.forEach(function(sound) {
            sound.play(delay, offset);
        });
        return group;
    };

    var pause = function() {
        sounds.forEach(function(sound) {
            if(sound.playing) {
                sound.pause();
            }
        });
        return group;
    };

    var resume = function() {
        sounds.forEach(function(sound) {
            if(sound.paused) {
                sound.play();
            }
        });
        return group;
    };

    var stop = function() {
        sounds.forEach(function(sound) {
            sound.stop();
        });
        return group;
    };

    var seek = function(percent) {
        sounds.forEach(function(sound) {
            sound.seek(percent);
        });
        return group;
    };

    var mute = function() {
        preMuteVolume = group.volume;
        group.volume = 0;
        return group;
    };

    var unMute = function() {
        group.volume = preMuteVolume || 1;
        return group;
    };

    var setVolume = function(value) {
        group.volume = value;
        return group;
    };

    var fade = function(volume, duration) {
        if(context) {
            var param = gain.gain;
            var time = context.currentTime;

            param.cancelScheduledValues(time);
            param.setValueAtTime(param.value, time);
            // param.setValueAtTime(volume, time + duration);
            param.linearRampToValueAtTime(volume, time + duration);
            // param.setTargetAtTime(volume, time, duration);
            // param.exponentialRampToValueAtTime(Math.max(volume, 0.0001), time + duration);
        }
        else {
            sounds.forEach(function(sound) {
                sound.fade(volume, duration);
            });
        }

        return group;
    };

    /*
     * Destroy
     */

    var destroy = function() {
        while(sounds.length) {
            sounds.pop().destroy();
        }
    };

    /*
     * Api
     */

    group = {
        add: add,
        find: find,
        remove: remove,
        play: play,
        pause: pause,
        resume: resume,
        stop: stop,
        seek: seek,
        setVolume: setVolume,
        mute: mute,
        unMute: unMute,
        fade: fade,
        destroy: destroy
    };

    /*
     * Getters & Setters
     */

    Object.defineProperties(group, {
        effect: {
            value: effect
        },
        gain: {
            value: gain
        },
        sounds: {
            value: sounds
        },
        volume: {
            get: function() {
                return gain.gain.value;
            },
            set: function(value) {
                if(isNaN(value)) { return; }

                if(context) {
                    gain.gain.cancelScheduledValues(context.currentTime);
                    gain.gain.value = value;
                    gain.gain.setValueAtTime(value, context.currentTime);
                }
                else {
                    gain.gain.value = value;
                }
                sounds.forEach(function(sound) {
                    if (!sound.context) {
                        sound.groupVolume = value;
                    }
                });
            }
        }
    });

    return group;
}

module.exports = Group;
