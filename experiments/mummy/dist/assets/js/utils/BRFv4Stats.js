(function() {
	"use strict";

  function checkObjectAvailable() {

    if(!window.hasOwnProperty("brfv4Example")) {

      setTimeout(checkObjectAvailable, 100);

    } else if(window.brfv4Example.hasOwnProperty("stats")) {

      var stats = brfv4Example.stats;

      stats.init = function(numTimesPerFrame) {

        stats.stats = new Stats();
        stats.stats.setMode(0); // 0: fps, 1: ms, 2: mb
        stats.stats.setNumTimesPerFrame(numTimesPerFrame);

        var statsParent = document.getElementById("_stats");
        if(!statsParent) { statsParent = document.body; }

        statsParent.appendChild(stats.stats.domElement);
      };

      stats.start = function() {
        if(stats.stats != null) stats.stats.begin();	// Starts the FPS measurement.
      };

      stats.end = function() {
        if(stats.stats != null) stats.stats.end();		// Ends the FPS measurement.
      };

      stats.init(60);
    }
  }

	/**
	 * Based on MrDoobs https://github.com/mrdoob/stats.js
	 * Changed the MS panel to show the MS average of the last 30 frames.
	 */

	var Stats = function () {

		var mode = 0;

		var timesCounter = 0;
		var timesLength = 30;
		var times = [];

		var container = document.createElement( 'div' );
		container.style.cssText = 'position:absolute;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
		container.addEventListener( 'click', function ( event ) {

			event.preventDefault();
			showPanel( ++ mode % container.children.length );

		}, false );

		function addPanel( panel ) {
			container.appendChild( panel.dom );
			return panel;
		}

		function showPanel( id ) {
			for ( var i = 0; i < container.children.length; i ++ ) {
				container.children[ i ].style.display = i === id ? 'block' : 'none';
			}
			mode = id;
		}

		function setNumTimesPerFrame(numTimesPerFrame) {
			timesLength = numTimesPerFrame;
		}

		var beginTime = ( performance || Date ).now(), prevTime = beginTime, frames = 0;

		var fpsPanel = addPanel( new Stats.Panel( 'FPS', '#00a0ff', '#002' ) );
		var msPanel = addPanel( new Stats.Panel( 'MS', '#ffd200', '#020' ) );

		if ( self.performance && self.performance.memory ) {
			var memPanel = addPanel( new Stats.Panel( 'MB', '#f08', '#201' ) );
		}

		showPanel( 0 );

		return {

			REVISION: 16,

			dom: container,

			addPanel: addPanel,
			showPanel: showPanel,
			setNumTimesPerFrame: setNumTimesPerFrame,

			begin: function () {
				beginTime = ( performance || Date ).now();
			},

			end: function () {

				frames++;

				var time = ( performance || Date ).now();
				var i;

				if(times.length < timesLength) {
					for(i = times.length; i < timesLength; i++) {
						times.push(30);
					}
				}

				var ms = time - beginTime;

				// update only every 30th frame.

				if(timesCounter < timesLength) {

					times[timesCounter] = ms;

					timesCounter++;

					if(timesCounter >= timesLength) {
						var sumMS = 0;
						for(i = 0; i < timesLength; i++) {
							sumMS += times[i];
						}
						ms = sumMS / timesLength;
						msPanel.update( ms, 200 );
						timesCounter = 0;
					}
				}

				if ( time > prevTime + 1000 ) {

					fpsPanel.update( ( frames * 1000 ) / ( time - prevTime ), 100 );

					prevTime = time;
					frames = 0;

					if ( memPanel ) {

						var memory = performance.memory;
						memPanel.update( memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576 );
					}
				}
				return time;
			},

			update: function () {
				beginTime = this.end();
			},

			// Backwards Compatibility

			domElement: container,
			setMode: showPanel
		};
	};

	Stats.Panel = function ( name, fg, bg ) {

		var min = Infinity, max = 0, round = Math.round;
		var PR = round( window.devicePixelRatio || 1 );

		var WIDTH = 80 * PR, HEIGHT = 48 * PR,
			TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
			GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
			GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

		var canvas = document.createElement( 'canvas' );
		canvas.width = WIDTH;
		canvas.height = HEIGHT;
		canvas.style.cssText = 'width:80px;height:48px';

		var context = canvas.getContext( '2d' );
		context.font = 'bold ' + ( 9 * PR ) + 'px Helvetica,Arial,sans-serif';
		context.textBaseline = 'top';

		context.fillStyle = bg;
		context.fillRect( 0, 0, WIDTH, HEIGHT );

		context.fillStyle = fg;
		context.fillText( name, TEXT_X, TEXT_Y );
		context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

		context.fillStyle = bg;
		context.globalAlpha = 0.9;
		context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

		return {

			dom: canvas,

			update: function ( value, maxValue ) {

				min = Math.min( min, value );
				max = Math.max( max, value );

				context.fillStyle = bg;
				context.globalAlpha = 1;
				context.fillRect( 0, 0, WIDTH, GRAPH_Y );
				context.fillStyle = fg;
				context.fillText( round( value ) + ' ' + name + ' (' + round( min ) + '-' + round( max ) + ')', TEXT_X, TEXT_Y );

				context.drawImage( canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT );

				context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT );

				context.fillStyle = bg;
				context.globalAlpha = 0.9;
				context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round( ( 1 - ( value / maxValue ) ) * GRAPH_HEIGHT ) );
			}
		};
	};

  checkObjectAvailable();
})();
