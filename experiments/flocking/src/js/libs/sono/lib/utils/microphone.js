'use strict';

function Microphone(connected, denied, error) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    error = error || function() {};

    var isSupported = !!navigator.getUserMedia,
        stream = null,
        api = {};

    var connect = function() {
        if(!isSupported) { return; }

        navigator.getUserMedia({audio:true}, function(micStream) {
            stream = micStream;
            connected(stream);
        }, function(e) {
            if(denied && e.name === 'PermissionDeniedError' || e === 'PERMISSION_DENIED') {
                // console.log('Permission denied. Reset by clicking the camera icon with the red cross in the address bar');
                denied();
            }
            else {
                error(e.message || e);
            }
        });
        return api;
    };

    var disconnect = function() {
        if(stream) {
            stream.stop();
            stream = null;
        }
        return api;
    };

    Object.defineProperties(api, {
        connect: {
            value: connect
        },
        disconnect: {
            value: disconnect
        },
        isSupported: {
            value: isSupported
        },
        stream: {
            get: function() {
                return stream;
            }
        }
    });

    return Object.freeze(api);
}


module.exports = Microphone;
