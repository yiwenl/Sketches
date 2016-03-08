'use strict';

function waveform() {

    var buffer,
        wave;

    return function(audioBuffer, length) {
        if(!window.Float32Array || !window.AudioBuffer) { return []; }

        var sameBuffer = buffer === audioBuffer;
        var sameLength = wave && wave.length === length;
        if(sameBuffer && sameLength) { return wave; }

        //console.time('waveData');
        if(!wave || wave.length !== length) {
            wave = new Float32Array(length);
        }

        if(!audioBuffer) { return wave; }

        // cache for repeated calls
        buffer = audioBuffer;

        var chunk = Math.floor(buffer.length / length),
            resolution = 5, // 10
            incr = Math.max(Math.floor(chunk / resolution), 1),
            greatest = 0;

        for(var i = 0; i < buffer.numberOfChannels; i++) {
            // check each channel
            var channel = buffer.getChannelData(i);
            for(var j = 0; j < length; j++) {
                // get highest value within the chunk
                for(var k = j * chunk, l = k + chunk; k < l; k += incr) {
                    // select highest value from channels
                    var a = channel[k];
                    if(a < 0) { a = -a; }
                    if(a > wave[j]) {
                        wave[j] = a;
                    }
                    // update highest overall for scaling
                    if(a > greatest) {
                        greatest = a;
                    }
                }
            }
        }
        // scale up
        var scale = 1 / greatest;
        for(i = 0; i < wave.length; i++) {
            wave[i] *= scale;
        }
        //console.timeEnd('waveData');

        return wave;
    };
}

module.exports = waveform;
