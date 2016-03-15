/*
INSPIRATIONS:
Structure inspired by:
	http://viget.com/extend/2666
Page Visibility API and Polyfill for vendor prefixes:
	http://stackoverflow.com/questions/1060008/is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active
	http://www.w3.org/TR/page-visibility/
	http://caniuse.com/#feat=pagevisibility
	http://jsfiddle.net/0GiS0/cAG5N/

Each flake has its own personal resistance to wind and gravity, giving their own speed and a feeling of randomness 
to the way they fall. Bigger flakes move faster to give the illusion that they're closer, even though there's no 
third dimension here. Future improvements would include spacing out the initial placement of the snowflakes to make 
sure they don't accidentally start in the same spot. (Not likely, but possible with random placement.)
*/
window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       || 
			window.webkitRequestAnimationFrame || 
			window.mozRequestAnimationFrame    || 
			window.oRequestAnimationFrame      || 
			window.msRequestAnimationFrame     || 
			function( callback ){
			window.setTimeout(callback, 1000 / 60);
			};
})();

var APP = {
	props: {
		width:600,				// Width of our canvas app. Used when creating the canvas and testing its bounds.
		height:300,				// Height of our canvas app.
		keycodes: {
			SPACE: 32,
			LEFT: 37,
			RIGHT: 39,
			UP: 38,
			DOWN: 40
		},
		paused: false,
		textColor: '#FFFD8A',
		frameNum:0,
		avgFPS:0,
		gravity:80,
		wind:15
	},
	pause: function() {
		console.log('APP.pause()');
		window.cancelAnimationFrame(APP.core.animationFrame);
		APP.props.paused = true;
	},
	play: function() {
		console.log('APP.play()');
		APP.core.then = Date.now();
		APP.props.paused = false;
		APP.core.frame();
	},
	init: function() {

		// Setting strings to match vendor visibility names.
		if (typeof document.hidden !== "undefined") {
			APP.hidden = "hidden", APP.visibilityChange = "visibilitychange", APP.visibilityState = "visibilityState";
		} else if (typeof document.mozHidden !== "undefined") {
			APP.hidden = "mozHidden", APP.visibilityChange = "mozvisibilitychange", APP.visibilityState = "mozVisibilityState";
		} else if (typeof document.msHidden !== "undefined") {
			APP.hidden = "msHidden", APP.visibilityChange = "msvisibilitychange", APP.visibilityState = "msVisibilityState";
		} else if (typeof document.webkitHidden !== "undefined") {
			APP.hidden = "webkitHidden", APP.visibilityChange = "webkitvisibilitychange", APP.visibilityState = "webkitVisibilityState";
		}
		// We'll check this against the document in the listener function.
		APP.document_hidden = document[APP.hidden];

		// Proceed with canvas stuff.
		APP.setup.createCanvas();
		APP.setup.createObjects();
		APP.setup.addListeners();
		APP.play();
	},
	setup: {
		createCanvas: function() {
			APP.canvas = document.createElement('canvas');
			APP.canvas.width = APP.props.width;
			APP.canvas.height = APP.props.height;
			APP.context = APP.canvas.getContext('2d');
			document.getElementById('canvasContainer').appendChild(APP.canvas);
		},
		addListeners: function() {
			document.addEventListener(APP.visibilityChange, function() {
				if(APP.document_hidden !== document[APP.hidden]) {
					if(document[APP.hidden]) {
						APP.pause(); // Pause the animation when the document is hidden.
					} else {
						APP.play(); // When the document is visible, play the animation.
					}
					APP.document_hidden = document[APP.hidden];
				}
			});

			// http://stackoverflow.com/questions/1402698/binding-arrow-keys-in-js-jquery
			document.onkeydown = function(event) {
				event = event || window.event;
				switch(event.which || event.keyCode) {
					case APP.props.keycodes.SPACE: // left
						console.log('SPACE');
						if ( APP.props.paused === true ) {
							APP.play();
						} else {
							APP.pause();
						}
						break;

					case APP.props.keycodes.LEFT: // left
						console.log('LEFT');
						break;

					case APP.props.keycodes.UP: // up
						console.log('UP');
						break;

					case APP.props.keycodes.RIGHT: // right
						console.log('RIGHT');
						break;

					case APP.props.keycodes.DOWN: // down
						console.log('DOWN');
						break;

					default: return; // exit this handler for other keys
				}
				event.preventDefault(); // prevent the default action (scroll / move caret)
			};
		},
		createObjects: function() {
			console.log('createObjects()');

			// Two flakes for each 50 pixels across and each 50 pixels down.
			APP.numFlakes = (APP.canvas.width/50 * 2) * (APP.canvas.height/50 * 2);
			APP.snowflakes = [];
			
			for (i = 0; i< APP.numFlakes; i++) {
				// Randomly placed, but no less than 10 pixels from each side.
				var tempX = 10 + ( Math.floor( Math.random() * (APP.canvas.width - 10) ) ),
				tempY = 10 + ( Math.floor( Math.random() * (APP.canvas.height - 10) ) ),
				tempRadius = 2 + ( Math.ceil( Math.random() * 4 ) ),
				tempResistance = (100 - (Math.floor(Math.random() * 50))) / 100; // Random 5 to 15, from 100, then turned into decimal. Ex .85

				var tempSpeed = (tempRadius - 2) * 10;
				
				// New Snowflake instance.
				var SnowflakeTemp = new APP.snowflake( { context:APP.context, x:tempX, y:tempY, radius:tempRadius, resistance:tempResistance, speed:tempSpeed } );
				APP.snowflakes.push(SnowflakeTemp);
			}
		}
	},
	core: {
		frame: function() {
			if ( APP.props.paused === false ) {
				APP.core.updateInterval();
				APP.core.update();
				APP.core.render();
				APP.core.animationFrame = window.requestAnimationFrame(APP.core.frame);
			}
		},
		updateInterval: function() {
			APP.core.now = Date.now();
			APP.core.interval = (APP.core.now - APP.core.then) / 1000;// seconds since last frame.
			APP.core.then = APP.core.now;

			// Only calculate FPS occasionally.
			if (APP.props.frameNum % 20 == 0) {
				var tempFPS = Math.round(1000/(APP.core.interval*1000));
				APP.props.avgFPS = isFinite(tempFPS) ? tempFPS : 0;
			}
		},
		update: function() {
			// Render updates to browser (draw to canvas, update css, etc.)
			APP.props.frameNum ++;

		},
		render: function() {
			// Update values
			APP.clearCanvas();
			APP.renderObjects();
			APP.renderCornerText();
		}
	},
	clearCanvas : function() {
		//Background
		APP.context.clearRect ( 0, 0, APP.canvas.width, APP.canvas.height)
	},
	renderCornerText : function() {
		//Text
		APP.context.fillStyle = APP.props.textColor;
		APP.context.font = "14px Arial";
		APP.context.textBaseline = "top";       
		APP.context.textAlign="right";
		APP.context.fillText("Number of Flakes: " + APP.numFlakes, APP.canvas.width - 10, 10);
		APP.context.fillText("fps: " + APP.props.avgFPS, APP.canvas.width - 10, 30);
	},
	renderObjects : function() {
		//console.log('renderFlakes()');
		for (i = 0; i< APP.snowflakes.length; i++) {
			APP.snowflakes[i].updatePosition();
			APP.snowflakes[i].drawSelf();
		}
	}
};