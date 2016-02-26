'use strict';

// https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode
// For lowpass and highpass Q indicates how peaked the frequency is around the cutoff.
// The greater the value is, the greater is the peak

function Filter(context, type, frequency, q, gain) {
    // Frequency between 40Hz and half of the sampling rate
    var minFrequency = 40;
    var maxFrequency = context.sampleRate / 2;

    var node = context.createBiquadFilter();
    node.type = type;

    var getFrequency = function(value) {
        // Logarithm (base 2) to compute how many octaves fall in the range.
        var numberOfOctaves = Math.log(maxFrequency / minFrequency) / Math.LN2;
        // Compute a multiplier from 0 to 1 based on an exponential scale.
        var multiplier = Math.pow(2, numberOfOctaves * (value - 1.0));
        // Get back to the frequency value between min and max.
        return maxFrequency * multiplier;
    };

    node.set = function(frequency, q, gain) {
      if (frequency !== undefined) { node.frequency.value = frequency; }
      if (q !== undefined) { node.Q.value = q; }
      if (gain !== undefined) { node.gain.value = gain; }
      return node;
    };

    // set filter frequency based on value from 0 to 1
    node.setByPercent = function(percent, q, gain) {
        return node.set(getFrequency(percent), q, gain);
    };

    return node.set(frequency, q, gain);
}

module.exports = Filter;
