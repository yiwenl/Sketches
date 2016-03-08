'use strict';

function ScriptSource(data, context) {
    var bufferSize = data.bufferSize || 1024,
        channels = data.channels || 1,
        ended = false,
        onProcess = data.callback.bind(data.thisArg || this),
        paused = false,
        pausedAt = 0,
        playing = false,
        sourceNode = null, // ScriptSourceNode
        startedAt = 0,
        api;

    var createSourceNode = function() {
        if(!sourceNode && context) {
            sourceNode = context.createScriptProcessor(bufferSize, 0, channels);
        }
        return sourceNode;
    };

    /*
     * Controls
     */

    var play = function(delay) {
        delay = delay ? context.currentTime + delay : 0;

        createSourceNode();
        sourceNode.onaudioprocess = onProcess;

        startedAt = context.currentTime - pausedAt;
        ended = false;
        paused = false;
        pausedAt = 0;
        playing = true;
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
            sourceNode.onaudioprocess = onPaused;
        }
        ended = true;
        paused = false;
        pausedAt = 0;
        playing = false;
        startedAt = 0;
    };

    var onPaused = function(event) {
        var buffer = event.outputBuffer;
        for (var i = 0; i < buffer.numberOfChannels; i++) {
            var channel = buffer.getChannelData(i);
            for (var j = 0; j < channel.length; j++) {
                channel[j] = 0;
            }
        }
    };

    /*
     * Destroy
     */

    var destroy = function() {
        this.stop();
        context = null;
        onProcess = null;
        sourceNode = null;
    };

    /*
     * Api
     */

    api = {
        play: play,
        pause: pause,
        stop: stop,
        destroy: destroy,

        duration: 0,
        progress: 0
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
        ended: {
            get: function() {
                return ended;
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
        sourceNode: {
            get: function() {
                return createSourceNode();
            }
        }
    });

    return Object.freeze(api);
}

module.exports = ScriptSource;
