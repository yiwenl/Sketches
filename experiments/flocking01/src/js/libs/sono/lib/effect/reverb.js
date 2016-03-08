'use strict';

var validify = require('../utils/validify.js').number;

function Reverb(context, config) {
    config = config || {};

    var time = validify(config.time, 1),
        decay = validify(config.decay, 5),
        reverse = !!config.reverse,
        rate = context.sampleRate,
        length,
        impulseResponse;

    var input = context.createGain();
    var reverb = context.createConvolver();
    var output = context.createGain();

    input.connect(reverb);
    input.connect(output);
    reverb.connect(output);

    var node = input;
    node.name = 'Reverb';
    node._output = output;

    node.update = function(opt) {
        if(opt.time !== undefined) {
            time = opt.time;
            length = Math.floor(rate * time);
            impulseResponse = length ? context.createBuffer(2, length, rate) : null;
        }
        if(opt.decay !== undefined) {
            decay = opt.decay;
        }
        if(opt.reverse !== undefined) {
            reverse = opt.reverse;
        }

        if(!impulseResponse) {
          reverb.buffer = null;
          return;
        }

        var left = impulseResponse.getChannelData(0),
            right = impulseResponse.getChannelData(1),
            n, e;

        for (var i = 0; i < length; i++) {
            n = reverse ? length - i : i;
            e = Math.pow(1 - n / length, decay);
            left[i] = (Math.random() * 2 - 1) * e;
            right[i] = (Math.random() * 2 - 1) * e;
        }

        reverb.buffer = impulseResponse;
    };

    node.update({
        time: time,
        decay: decay,
        reverse: reverse
    });

    Object.defineProperties(node, {
        time: {
            get: function() { return time; },
            set: function(value) {
                console.log.call(console, '1 set time:', value);
                if(value === time) { return; }
                this.update({time: value});
            }
        },
        decay: {
            get: function() { return decay; },
            set: function(value) {
                if(value === decay) { return; }
                this.update({decay: value});
            }
        },
        reverse: {
            get: function() { return reverse; },
            set: function(value) {
                if(value === reverse) { return; }
                this.update({reverse: !!value});
            }
        }
    });

    return node;
}

module.exports = Reverb;
