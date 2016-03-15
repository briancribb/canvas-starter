/*
INSPIRATIONS:
Structure inspired by:
	http://viget.com/extend/2666
Page Visibility API and Polyfill for vendor prefixes:
	http://stackoverflow.com/questions/1060008/is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active
	http://www.w3.org/TR/page-visibility/
	http://caniuse.com/#feat=pagevisibility
	http://jsfiddle.net/0GiS0/cAG5N/
*/

var APP = {
	states: {
		INIT: "INIT",
		READY: "READY"
	},
	currentState: 'INIT',
	props: {
		now:null,				// "now" and "then" get initial values in APP.setup.addListeners().
		then:null,
		interval:0,
		width:600,				// Width of our canvas app. Used when creating the canvas and testing its bounds.
		height:300,				// Height of our canvas app.
		textColor: '#FFFD8A',
		keycodes: {
			SPACE: 32,
			LEFT: 37,
			RIGHT: 39,
			UP: 38,
			DOWN: 40
		},
		assets: [
			{id:"canvas_book", src:"img/html5-canvas-book.jpg"},
			{id:"lynda", src:"img/lynda-logo-square-200.gif"},
			{id:"curiosity", src:"img/curiosity-tars-tarkas.jpg"},
			{id:"ie6_old", src:"img/ie6-old.png"}
			],
		fpsText : '',
		snowflakes : [],
		gravity:80,
		wind:15
	},
	pause: function() {
		//console.log('APP.pause()');
		createjs.Ticker.paused = true;
	},
	play: function() {
		//console.log('APP.play()');
		APP.props.then = Date.now();	// Resetting the 'then'.
		createjs.Ticker.paused = false;
	},
	init: function(targetID) {

		/* Setting strings to match vendor visibility names. */
		if (typeof document.hidden !== "undefined") {
			APP.hidden = "hidden", APP.visibilityChange = "visibilitychange", APP.visibilityState = "visibilityState";
		} else if (typeof document.mozHidden !== "undefined") {
			APP.hidden = "mozHidden", APP.visibilityChange = "mozvisibilitychange", APP.visibilityState = "mozVisibilityState";
		} else if (typeof document.msHidden !== "undefined") {
			APP.hidden = "msHidden", APP.visibilityChange = "msvisibilitychange", APP.visibilityState = "msVisibilityState";
		} else if (typeof document.webkitHidden !== "undefined") {
			APP.hidden = "webkitHidden", APP.visibilityChange = "webkitvisibilitychange", APP.visibilityState = "webkitVisibilityState";
		}
		// We'll check this string against the document in the listener function.
		APP.document_hidden = document[APP.hidden];


		/* Setup */
		APP.setup.createCanvas(targetID);
		APP.setup.addListeners();
		APP.setup.createloadGraphic();


		/* Load assets. The handler functions for the queue live in init() rather than the addListeners function because they won't need to exist after init() has run. */
		var queue = new createjs.LoadQueue(true);
		queue.loadManifest(APP.props.assets);
		queue.on("fileload", handleFileLoad, this);
		queue.on("complete", handleComplete, this);

		function handleFileLoad(event) {
			console.log('handleFileLoad()');

			// Add any images to the page body. Just a temporary thing for testing.
			if (event.item.type === createjs.LoadQueue.IMAGE) {
				document.body.appendChild(event.result);
			}
		}
		function handleComplete(event) {
			console.log('handleComplete()');
			/* Once assets are loaded, run the rest of the app. */
			APP.setup.createObjects();
			APP.play();
			APP.stage.removeChild(APP.loadGraphic);
			APP.currentState = APP.states.READY;
		}
	},
	setup: {
		createCanvas: function(targetID) {
			APP.canvas = document.createElement('canvas');
			APP.canvas.width = APP.props.width;
			APP.canvas.height = APP.props.height;
			APP.context = APP.canvas.getContext('2d');
			document.getElementById(targetID).appendChild(APP.canvas);
			APP.stage = new createjs.Stage(APP.canvas);

			// Setting bounds so CreateJS doesn't keep calculating them.
			APP.stage.setBounds(0, 0, APP.props.width, APP.props.height);
		},
		addListeners: function() {
			// Visibility API
			document.addEventListener(APP.visibilityChange, function() {
				if(APP.document_hidden !== document[APP.hidden]) {
					if(document[APP.hidden]) {
						// Pause the animation when the document is hidden.
						APP.pause();
					} else {
						// When the document is visible, play the animation.
						APP.play();
					}
					APP.document_hidden = document[APP.hidden];
					console.log('visibilityChange(): APP.document_hidden = ' + APP.document_hidden);
				}
			});

			// http://stackoverflow.com/questions/1402698/binding-arrow-keys-in-js-jquery
			document.onkeydown = function(event) {
				event = event || window.event;
				switch(event.which || event.keyCode) {
					case APP.props.keycodes.SPACE: // left
						//console.log('SPACE');
						var paused = !createjs.Ticker.getPaused();
						createjs.Ticker.setPaused(paused);
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


			// CreateJS Ticker
			createjs.Ticker.on("tick", APP.tick);
			APP.props.now = Date.now();							// Instantiating the 'now'.
			APP.props.then = createjs.Ticker.now;				// Instantiating the 'then'.


			/*
			This is fine for most animations, but isn't as good as using straight RAF. Delta doesn't 
			account for time spent on another tab. That can lead to weird stuff if you go away and come back.
			*/
			// createjs.Ticker.setFPS(60);


			/*
			Using requestAnimationFrame because it's better.
			Although it's tempting to just set the FPS to 60 and use the Ticker event's delta value, this can get 
			weird under certain circumstances. The delta value doesn't account for time spent on other tabs. When 
			you come back, your objects are in weird positions. For this reason, I just set the animation to use 
			requestAnimationFrame and I calculate my own FPS which accounts for pausing and going to other tabs.
			*/
			createjs.Ticker.timingMode = createjs.Ticker.RAF;
		},
		createloadGraphic: function() {
			console.log('createloadGraphic()');
			/* Some small animation that does not require external assets. This will play until the all of assets in the manifest are loaded. */
			APP.loadGraphic = new createjs.Shape();
			APP.loadGraphic.graphics.beginFill("#4385E0").drawCircle(0, 0, 50);
			APP.loadGraphic.x = 100;
			APP.loadGraphic.y = 100;
			APP.stage.addChild(APP.loadGraphic);
		},
		createObjects: function() {
			/* Make all the stuff that will move around on the stage. */
			/*
			console.log('createObjects()');
			APP.props.fpsText = new createjs.Text("Hello World", "14px Arial", APP.props.textColor);
			APP.props.fpsText.textAlign = "right";
			APP.props.fpsText.x = APP.canvas.width - 10;
			APP.props.fpsText.y = 10;
			APP.stage.addChild(APP.props.fpsText);
			*/

			var numFlakes = (APP.canvas.width/50 * 2) * (APP.canvas.height/50 * 2);

			for (i = 0; i < numFlakes; i++) {
				// Randomly placed, but no less than 10 pixels from each side.
				var tempX = 10 + ( Math.floor( Math.random() * (APP.canvas.width - 10) ) ),
					tempY = 10 + ( Math.floor( Math.random() * (APP.canvas.height - 10) ) ),
					tempRadius = 2 + ( Math.floor( Math.random() * 4 ) ),
					tempResistance = (100 - (Math.floor(Math.random() * 50))) / 100; // Random 5 to 15, from 100, then turned into decimal. Ex .85

				var tempSpeed = (tempRadius - 2) * 10;
				
				// New Snowflake instance.
				//var tempSnowflake = new APP.snowflake( { context:APP.context, x:tempX, y:tempY, radius:tempRadius, resistance:tempResistance, speed:tempSpeed } );
				var tempSnowflake = new classes.Snowflake( { canvas:APP.canvas, id:i, x:tempX, y:tempY, radius:tempRadius, resistance:tempResistance, speed:tempSpeed } );
				APP.props.snowflakes.push(tempSnowflake);
				APP.stage.addChild(tempSnowflake);
			}
		}
	},
	tick: function(event) {

		if ( createjs.Ticker.paused === false ) {
			APP.updateInterval();
			switch(APP.currentState) {
				case 'INIT':
					//console.log('APP.tick() - INIT: ' + APP.currentState);
					APP.updateloadGraphic(APP.props.interval);
					break;
				default:
					//console.log('APP.tick() - READY: ' + APP.currentState);
					//console.log( 'Time: ' + (APP.props.now) );
					APP.updateObjects(APP.props.interval);
			}
			APP.stage.update(event); // important!!
		}
	},
	getFPS: function(elapsed) {
		/* Reasons are explained in APP.setup.addListeners(), but we're going to calculate our own delta values for this animation. */
		var now = createjs.Ticker.getTime(),
			fps = 0;

		var tempFPS = Math.round(1000/(elapsed*1000));
		fps = isFinite(tempFPS) ? tempFPS : 0;

		return fps;
	},
	updateInterval: function() {
		APP.props.now = Date.now();
		APP.props.interval = (APP.props.now - APP.props.then) / 1000;// seconds since last frame.
		APP.props.then = APP.props.now;
	},
	updateloadGraphic : function(elapsed) {
		/* Simple logic to update the loading graphic while the user waits for assets. */
		APP.loadGraphic.x += elapsed/1000*100;
		if (APP.loadGraphic.x > APP.canvas.width) {
			APP.loadGraphic.x -= APP.canvas.width;
		}
	},
	updateObjects : function(elapsed) {
		var snowflakesArray = APP.props.snowflakes;
		//APP.props.fpsText.text = APP.getFPS(elapsed);
		// move 100 pixels per second (elapsedTimeInMS / 1000msPerSecond * pixelsPerSecond):
		//if (createjs.Ticker.getTicks() % 20 == 0) {
			//console.log('updateObjects() ticks = ' + createjs.Ticker.getTicks());
		//	APP.updateCornerText();
		//}

		for(var i=0; i<snowflakesArray.length; i++) {
			//APP.snowflakes[i].updatePosition(elapsed);

			// vx means "horizontal velocity" and vr means "rotational velocity". Adding them to the x and rotation properties.


			snowflakesArray[i].x += ((APP.props.wind + snowflakesArray[i].speed) * snowflakesArray[i].resistance) * (elapsed);
			snowflakesArray[i].y += ((APP.props.gravity + snowflakesArray[i].speed) * snowflakesArray[i].resistance) * (elapsed);


			// Preparing velocities for the next frame.
			//=========================================
			// wrapping from the left wall.
			if ( (snowflakesArray[i].x + snowflakesArray[i].radius) < 0 ) {
				snowflakesArray[i].x = APP.canvas.width + snowflakesArray[i].radius;
			}
			// wrapping from the right wall.
			if ( (snowflakesArray[i].x - snowflakesArray[i].radius) > APP.canvas.width ) {
				snowflakesArray[i].x = 0 - snowflakesArray[i].radius;
			}
			// wrapping from the floor.
			if ( (snowflakesArray[i].y + snowflakesArray[i].radius) > APP.canvas.height+10) {
				snowflakesArray[i].y = -10 - snowflakesArray[i].radius;
			}
		}
	}
};

APP.init('canvasContainer');