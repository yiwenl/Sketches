'use strict';

function MicrophoneSource(stream, context) {
    var ended = false,
        paused = false,
        pausedAt = 0,
        playing = false,
        sourceNode = null, // MicrophoneSourceNode
        startedAt = 0;

    var createSourceNode = function() {
        if(!sourceNode && context) {
            sourceNode = context.createMediaStreamSource(stream);
            // HACK: stops moz garbage collection killing the stream
            // see https://support.mozilla.org/en-US/questions/984179
            if(navigator.mozGetUserMedia) {
                window.mozHack = sourceNode;
            }
        }
        return sourceNode;
    };

    /*
     * Controls
     */

    var play = function(delay) {
        delay = delay ? context.currentTime + delay : 0;

        createSourceNode();
        sourceNode.start(delay);

        startedAt = context.currentTime - pausedAt;
        ended = false;
        playing = true;
        paused = false;
        pausedAt = 0;
    };

    var pause = function() {
        var elapsed = context.currentTime - startedAt;
        stop();
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
        stop();
        context = null;
        sourceNode = null;
        stream = null;
        window.mozHack = null;
    };

    /*
     * Api
     */

    var api = {
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

module.exports = MicrophoneSource;
