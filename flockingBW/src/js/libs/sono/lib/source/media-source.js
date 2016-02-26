'use strict';

function MediaSource(el, context, onEnded) {
    var ended = false,
        endedCallback = onEnded,
        delayTimeout,
        fadeTimeout,
        loop = false,
        paused = false,
        playbackRate = 1,
        playing = false,
        sourceNode = null,
        groupVolume = 1,
        volume = 1,
        api = {};

    var createSourceNode = function() {
        if(!sourceNode && context) {
            sourceNode = context.createMediaElementSource(el);
        }
        return sourceNode;
    };

    /*
     * Load
     */

    var load = function(url) {
        el.src = url;
        el.load();
        ended = false;
        paused = false;
        playing = false;
    };

    /*
     * Controls
     */

    var play = function(delay, offset) {
        clearTimeout(delayTimeout);

        el.volume = volume * groupVolume;
        el.playbackRate = playbackRate;

        if(offset) {
            el.currentTime = offset;
        }

        if(delay) {
            delayTimeout = setTimeout(play, delay);
        }
        else {
            // el.load();
            el.play();
        }

        ended = false;
        paused = false;
        playing = true;

        el.removeEventListener('ended', endedHandler);
        el.addEventListener('ended', endedHandler, false);

        if(el.readyState < 4) {
            el.removeEventListener('canplaythrough', readyHandler);
            el.addEventListener('canplaythrough', readyHandler, false);
            el.load();
            el.play();
        }
    };

    var readyHandler = function() {
        el.removeEventListener('canplaythrough', readyHandler);
        if(playing) {
            el.play();
        }
    };

    var pause = function() {
        clearTimeout(delayTimeout);

        if(!el) { return; }

        el.pause();
        playing = false;
        paused = true;
    };

    var stop = function() {
        clearTimeout(delayTimeout);

        if(!el) { return; }

        el.pause();

        try {
            el.currentTime = 0;
            // fixes bug where server doesn't support seek:
            if(el.currentTime > 0) { el.load(); }
        } catch(e) {}

        playing = false;
        paused = false;
    };

    /*
     * Fade for no webaudio
     */

    var fade = function(toVolume, duration) {
        if(context) { return api; }

        function ramp(value, step) {
            fadeTimeout = setTimeout(function() {
                api.volume = api.volume + ( value - api.volume ) * 0.2;
                if(Math.abs(api.volume - value) > 0.05) {
                    return ramp(value, step);
                }
                api.volume = value;
            }, step * 1000);
        }

        window.clearTimeout(fadeTimeout);
        ramp(toVolume, duration / 10);

        return api;
    };

    /*
     * Ended handler
     */

    var endedHandler = function() {
        ended = true;
        paused = false;
        playing = false;

        if(loop) {
            el.currentTime = 0;
            // fixes bug where server doesn't support seek:
            if(el.currentTime > 0) { el.load(); }
            play();
        } else if(typeof endedCallback === 'function') {
            endedCallback(api);
        }
    };

    /*
     * Destroy
     */

    var destroy = function() {
        el.removeEventListener('ended', endedHandler);
        el.removeEventListener('canplaythrough', readyHandler);
        stop();
        el = null;
        context = null;
        endedCallback = null;
        sourceNode = null;
    };

    /*
     * Getters & Setters
     */

    Object.defineProperties(api, {
        play: {
            value: play
        },
        pause: {
            value: pause
        },
        stop: {
            value: stop
        },
        load: {
            value: load
        },
        fade: {
            value: fade
        },
        destroy: {
            value: destroy
        },
        currentTime: {
            get: function() {
                return el ? el.currentTime : 0;
            }
        },
        duration: {
            get: function() {
                return el ? el.duration : 0;
            }
        },
        ended: {
            get: function() {
                return ended;
            }
        },
        loop: {
            get: function() {
                return loop;
            },
            set: function(value) {
                loop = !!value;
            }
        },
        paused: {
            get: function() {
                return paused;
            }
        },
        playbackRate: {
            get: function() {
                return playbackRate;
            },
            set: function(value) {
                playbackRate = value;
                if(el) {
                    el.playbackRate = playbackRate;
                }
            }
        },
        playing: {
            get: function() {
                return playing;
            }
        },
        progress: {
            get: function() {
                return el && el.duration ? el.currentTime / el.duration : 0;
            }
        },
        sourceNode: {
            get: function() {
                return createSourceNode();
            }
        },
        volume: {
            get: function() {
                return volume;
            },
            set: function(value) {
                window.clearTimeout(fadeTimeout);
                volume = value;
                if(el) {
                    el.volume = volume * groupVolume;
                }
            }
        },
        groupVolume: {
            get: function() {
                return groupVolume;
            },
            set: function(value) {
                groupVolume = value;
                if(el) {
                    el.volume = volume * groupVolume;
                }
            }
        }
    });

    return Object.freeze(api);
}

module.exports = MediaSource;
