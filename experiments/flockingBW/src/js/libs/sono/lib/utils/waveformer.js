'use strict';

var halfPI = Math.PI / 2;
var twoPI = Math.PI * 2;

module.exports = function waveformer(config) {

    var style = config.style || 'fill', // 'fill' or 'line'
        shape = config.shape || 'linear', // 'circular' or 'linear'
        color = config.color || 0,
        bgColor = config.bgColor,
        lineWidth = config.lineWidth || 1,
        percent = config.percent || 1,
        originX = config.x || 0,
        originY = config.y || 0,
        transform = config.transform,
        canvas = config.canvas,
        width = config.width || (canvas && canvas.width),
        height = config.height || (canvas && canvas.height),
        ctx, currentColor, waveform, length, i, value, x, y,
        radius, innerRadius, centerX, centerY;

    if(!canvas && !config.context) {
      canvas = document.createElement('canvas');
      width = width || canvas.width;
      height = height || canvas.height;
      canvas.width = height;
      canvas.height = height;
    }

    if(shape === 'circular') {
      radius = config.radius || Math.min(height / 2, width / 2),
      innerRadius = config.innerRadius || radius / 2;
      centerX = originX + width / 2;
      centerY = originY + height / 2;
    }

    ctx = config.context || canvas.getContext('2d');

    var clear = function() {
      if(bgColor) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(originX, originY, width, height);
      } else {
          ctx.clearRect(originX, originY, width, height);
      }

      ctx.lineWidth = lineWidth;

      currentColor = null;

      if(typeof color !== 'function') {
        ctx.strokeStyle = color;
        ctx.beginPath();
      }
    };

    var updateColor = function(position, length, value) {
      if(typeof color === 'function') {
        var newColor = color(position, length, value);
        if(newColor !== currentColor) {
          currentColor = newColor;
          ctx.stroke();
          ctx.strokeStyle = currentColor;
          ctx.beginPath();
        }
      }
    };

    var getValue = function(value, position, length) {
      if(typeof transform === 'function') {
        return transform(value, position, length);
      }
      return value;
    };

    var getWaveform = function(value, length) {
      if(value && typeof value.waveform === 'function') {
        return value.waveform(length);
      }
      if(value) {
        return value;
      }
      if(config.waveform) {
        return config.waveform;
      }
      if(config.sound) {
        return config.sound.waveform(length);
      }
      return null;
    };

    var update = function(wave) {

      clear();

      if(shape === 'circular') {

        waveform = getWaveform(wave, 360);
        length = Math.floor(waveform.length * percent);

        var step = twoPI / length,
            angle, magnitude, sine, cosine;

        for (i = 0; i < length; i++) {
          value = getValue(waveform[i], i, length);
          updateColor(i, length, value);

          angle = i * step - halfPI;
          cosine = Math.cos(angle);
          sine = Math.sin(angle);

          if(style === 'fill') {
            x = centerX + innerRadius * cosine;
            y = centerY + innerRadius * sine;
            ctx.moveTo(x, y);
          }

          magnitude = innerRadius + (radius - innerRadius) * value;
          x = centerX + magnitude * cosine;
          y = centerY + magnitude * sine;

          if(style === 'line' && i === 0) {
            ctx.moveTo(x, y);
          }

          ctx.lineTo(x, y);
        }

        if(style === 'line') {
          ctx.closePath();
        }
      }
      else {

        waveform = getWaveform(wave, width);
        length = Math.min(waveform.length, width - lineWidth / 2);
        length = Math.floor(length * percent);

        for(i = 0; i < length; i++) {
          value = getValue(waveform[i], i, length);
          updateColor(i, length, value);

          if(style === 'line' && i > 0) {
            ctx.lineTo(x, y);
          }

          x = originX + i;
          y = originY + height - Math.round(height * value);
          y = Math.floor(Math.min(y, originY + height - lineWidth / 2));

          if(style === 'fill') {
            ctx.moveTo(x, y);
            ctx.lineTo(x, originY + height);
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    };

    update.canvas = canvas;

    if(config.waveform || config.sound) {
      update();
    }

    return update;
};
