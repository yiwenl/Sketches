# glsl-easings [![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

[Robert Penner's easing functions](http://www.robertpenner.com/easing/) in GLSL,
available as a module for [glslify](http://github.com/chrisdickinson/glslify).

I tried as best I could to make them speedy for GLSL, but I'm sure there are a
lot of gaps to fill – pull requests welcome!

## Usage

[![NPM](https://nodei.co/npm/glsl-easings.png)](https://nodei.co/npm/glsl-easings/)

Each easing function has its own file which can be required from glslify:

``` glsl
#pragma glslify: ease = require(glsl-easings/back-in-out)
#pragma glslify: ease = require(glsl-easings/back-in)
#pragma glslify: ease = require(glsl-easings/back-out)
#pragma glslify: ease = require(glsl-easings/bounce-in-out)
#pragma glslify: ease = require(glsl-easings/bounce-in)
#pragma glslify: ease = require(glsl-easings/bounce-out)
#pragma glslify: ease = require(glsl-easings/circular-in-out)
#pragma glslify: ease = require(glsl-easings/circular-in)
#pragma glslify: ease = require(glsl-easings/circular-out)
#pragma glslify: ease = require(glsl-easings/cubic-in-out)
#pragma glslify: ease = require(glsl-easings/cubic-in)
#pragma glslify: ease = require(glsl-easings/cubic-out)
#pragma glslify: ease = require(glsl-easings/elastic-in-out)
#pragma glslify: ease = require(glsl-easings/elastic-in)
#pragma glslify: ease = require(glsl-easings/elastic-out)
#pragma glslify: ease = require(glsl-easings/exponential-in-out)
#pragma glslify: ease = require(glsl-easings/exponential-in)
#pragma glslify: ease = require(glsl-easings/exponential-out)
#pragma glslify: ease = require(glsl-easings/linear)
#pragma glslify: ease = require(glsl-easings/quadratic-in-out)
#pragma glslify: ease = require(glsl-easings/quadratic-in)
#pragma glslify: ease = require(glsl-easings/quadratic-out)
#pragma glslify: ease = require(glsl-easings/quartic-in-out)
#pragma glslify: ease = require(glsl-easings/quartic-in)
#pragma glslify: ease = require(glsl-easings/quartic-out)
#pragma glslify: ease = require(glsl-easings/quintic-in-out)
#pragma glslify: ease = require(glsl-easings/quintic-in)
#pragma glslify: ease = require(glsl-easings/quintic-out)
#pragma glslify: ease = require(glsl-easings/sine-in-out)
#pragma glslify: ease = require(glsl-easings/sine-in)
#pragma glslify: ease = require(glsl-easings/sine-out)
```

And each function has the following signature:

``` glsl
float ease(float t)
```

Where `t` is a value between 0 and 1, returning a new float between 0 and 1.

## License

MIT. See [LICENSE.md](http://github.com/hughsk/glsl-easings/blob/master/LICENSE.md) for details.
