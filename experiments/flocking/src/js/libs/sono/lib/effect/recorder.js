'use strict';

function Recorder(context, passThrough) {
    var bufferLength = 4096,
        buffersL = [],
        buffersR = [],
        startedAt = 0,
        stoppedAt = 0;

    var input = context.createGain();
    var output = context.createGain();
    var script;

    var node = input;
    node.name = 'Recorder';
    node._output = output;

    node.isRecording = false;

    var getBuffer = function() {
        if(!buffersL.length) {
            return context.createBuffer(2, bufferLength, context.sampleRate);
        }
        var recordingLength = buffersL.length * bufferLength;
        var buffer = context.createBuffer(2, recordingLength, context.sampleRate);
        buffer.getChannelData(0).set(mergeBuffers(buffersL, recordingLength));
        buffer.getChannelData(1).set(mergeBuffers(buffersR, recordingLength));
        return buffer;
    };

    var mergeBuffers = function(buffers, length) {
        var buffer = new Float32Array(length);
        var offset = 0;
        for (var i = 0; i < buffers.length; i++) {
          buffer.set(buffers[i], offset);
          offset += buffers[i].length;
        }
        return buffer;
    };

    var createScriptProcessor = function() {
      destroyScriptProcessor();

      script = context.createScriptProcessor(bufferLength, 2, 2);
      input.connect(script);
      script.connect(context.destination);
      script.connect(output);

      script.onaudioprocess = function (event) {
          var inputL = event.inputBuffer.getChannelData(0),
              inputR = event.inputBuffer.getChannelData(1);

          if(passThrough) {
              var outputL = event.outputBuffer.getChannelData(0),
                  outputR = event.outputBuffer.getChannelData(1);
              outputL.set(inputL);
              outputR.set(inputR);
          }

          if(node.isRecording) {
              buffersL.push(new Float32Array(inputL));
              buffersR.push(new Float32Array(inputR));
          }
      };
    };

    var destroyScriptProcessor = function() {
      if (script) {
        script.onaudioprocess = null;
        input.disconnect();
        script.disconnect();
      }
    };

    node.start = function() {
        createScriptProcessor();
        buffersL.length = 0;
        buffersR.length = 0;
        startedAt = context.currentTime;
        stoppedAt = 0;
        this.isRecording = true;
    };

    node.stop = function() {
        stoppedAt = context.currentTime;
        this.isRecording = false;
        destroyScriptProcessor();
        return getBuffer();
    };

    node.getDuration = function() {
        if(!this.isRecording) {
            return stoppedAt - startedAt;
        }
        return context.currentTime - startedAt;
    };

    return node;
}

module.exports = Recorder;
