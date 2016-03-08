'use strict';

var validify = require('../utils/validify.js').number;
var n = 22050;

function Distortion(context, amount) {

    amount = validify(amount, 1);

    var node = context.createWaveShaper();
    var curve = new Float32Array(n);

    // create waveShaper distortion curve from 0 to 1
    node.update = function(value) {
        amount = value;
        if(amount <= 0) {
          amount = 0;
          this.curve = null;
          return;
        }
        var k = value * 100,
            // n = 22050,
            // curve = new Float32Array(n),
            deg = Math.PI / 180,
            x;

        for (var i = 0; i < n; i++) {
            x = i * 2 / n - 1;
            curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }

        this.curve = curve;
    };

    Object.defineProperties(node, {
        amount: {
            get: function() { return amount; },
            set: function(value) { this.update(value); }
        }
    });

    if(amount !== undefined) {
        node.update(amount);
    }

    return node;
}

module.exports = Distortion;
