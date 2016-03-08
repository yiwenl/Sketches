'use strict';

function OscillatorSource(type, context) {
    var ended = false,
        paused = false,
        pausedAt = 0,
        playing = false,
        sourceNode = null, // OscillatorSourceNode
        startedAt = 0,
        frequency = 200,
        api;

    var createSourceNode = function() {
        if(!sourceNode && context) {
            sourceNode = context.createOscillator();
            sourceNode.type = type;
            sourceNode.frequency.value = frequency;
        }
        return sourceNode;
    };

    /*
     * Controls
     */

    var play = function(delay) {
        delay = delay || 0;
        if(delay) { delay = context.currentTime + delay; }

        createSourceNode();
        sourceNode.start(delay);

        if(pausedAt) {
            startedAt = context.currentTime - pausedAt;
        }
        else {
            startedAt = context.currentTime;
        }

        ended = false;
        playing = true;
        paused = false;
        pausedAt = 0;
    };

    var pause = function() {
        var elapsed = context.currentTime - startedAt;
        this.stop();
        pausedAt = elapsed;
        playing = false;
        paused = true;
    };

    var stop = function() {
        if(sourceNode) {
            try {
                sourceNode.stop(0);
            } catch(e) {}
            sourceNode = null;
        }
        ended = true;
        paused = false;
        pausedAt = 0;
        playing = false;
        startedAt = 0;
    };

    /*
     * Destroy
     */

    var destroy = function() {
        this.stop();
        context = null;
        sourceNode = null;
    };

    /*
     * Api
     */

    api = {
        play: play,
        pause: pause,
        stop: stop,
        destroy: destroy
    };

    /*
     * Getters & Setters
     */

    Object.defineProperties(api, {
        currentTime: {
            get: function() {
                if(pausedAt) {
                    return pausedAt;
                }
                if(startedAt) {
                    return context.currentTime - startedAt;
                }
                return 0;
            }
        },
        duration: {
            value: 0
        },
        ended: {
            get: function() {
                return ended;
            }
        },
        frequency: {
            get: function() {
                return frequency;
            },
            set: function(value) {
                frequency = value;
                if(sourceNode) {
                    sourceNode.frequency.value = value;
                }
            }
        },
        paused: {
            get: function() {
                return paused;
            }
        },
        playing: {
            get: function() {
                return playing;
            }
        },
        progress: {
            value: 0
        },
        sourceNode: {
            get: function() {
                return createSourceNode();
            }
        }
    });

    return Object.freeze(api);
}

module.exports = OscillatorSource;
