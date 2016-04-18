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
(function(){
	/*
	I like the object structure, but I dont want to expose the game to the console. So I'm putting the whole thing 
	into a closure. 
	*/









	var GAME = {
		states: {
			INIT: "INIT",
			READY: "READY"
		},
		currentState: 'INIT',
		props: {
			now:null,				// "now" and "then" get initial values in GAME.setup.addListeners().
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
				{id:"codeschool_logo", src:"img/2014_09_16_20_43_07_Logo-horizontal.png"}
				],
			fpsText : '',
			snowflakes : [],
			gravity:80,
			wind:15
		},
		pause: function() {
			//console.log('GAME.pause()');
			createjs.Ticker.paused = true;
		},
		play: function() {
			//console.log('GAME.play()');
			GAME.props.then = Date.now();	// Resetting the 'then'.
			createjs.Ticker.paused = false;
		},
		init: function(targetID) {

			/* Setting strings to match vendor visibility names. */
			if (typeof document.hidden !== "undefined") {
				GAME.hidden = "hidden", GAME.visibilityChange = "visibilitychange", GAME.visibilityState = "visibilityState";
			} else if (typeof document.mozHidden !== "undefined") {
				GAME.hidden = "mozHidden", GAME.visibilityChange = "mozvisibilitychange", GAME.visibilityState = "mozVisibilityState";
			} else if (typeof document.msHidden !== "undefined") {
				GAME.hidden = "msHidden", GAME.visibilityChange = "msvisibilitychange", GAME.visibilityState = "msVisibilityState";
			} else if (typeof document.webkitHidden !== "undefined") {
				GAME.hidden = "webkitHidden", GAME.visibilityChange = "webkitvisibilitychange", GAME.visibilityState = "webkitVisibilityState";
			}
			// We'll check this string against the document in the listener function.
			GAME.document_hidden = document[GAME.hidden];


			/* Setup */
			GAME.setup.createCanvas(targetID);
			GAME.setup.addListeners();
			GAME.setup.createloadGraphic();


			/* Load assets. The handler functions for the queue live in init() rather than the addListeners function because they won't need to exist after init() has run. */
			var queue = new createjs.LoadQueue(true);
			queue.loadManifest(GAME.props.assets);
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
				GAME.setup.createObjects();
				GAME.play();
				GAME.stage.removeChild(GAME.loadGraphic);
				GAME.currentState = GAME.states.READY;
			}
		},
		setup: {
			createCanvas: function(targetID) {
				GAME.canvas = document.createElement('canvas');
				GAME.canvas.width = GAME.props.width;
				GAME.canvas.height = GAME.props.height;
				GAME.context = GAME.canvas.getContext('2d');
				document.getElementById(targetID).appendChild(GAME.canvas);
				GAME.stage = new createjs.Stage(GAME.canvas);

				// Setting bounds so CreateJS doesn't keep calculating them.
				GAME.stage.setBounds(0, 0, GAME.props.width, GAME.props.height);
			},
			addListeners: function() {
				// Visibility API
				document.addEventListener(GAME.visibilityChange, function() {
					if(GAME.document_hidden !== document[GAME.hidden]) {
						if(document[GAME.hidden]) {
							// Pause the animation when the document is hidden.
							GAME.pause();
						} else {
							// When the document is visible, play the animation.
							GAME.play();
						}
						GAME.document_hidden = document[GAME.hidden];
						console.log('visibilityChange(): GAME.document_hidden = ' + GAME.document_hidden);
					}
				});

				// http://stackoverflow.com/questions/1402698/binding-arrow-keys-in-js-jquery
				document.onkeydown = function(event) {
					event = event || window.event;
					switch(event.which || event.keyCode) {
						case GAME.props.keycodes.SPACE: // left
							//console.log('SPACE');
							if (createjs.Ticker.getPaused() === true) {
								GAME.play();
							} else {
								GAME.pause();
							}
							break;

						case GAME.props.keycodes.LEFT: // left
							console.log('LEFT');
							break;

						case GAME.props.keycodes.UP: // up
							console.log('UP');
							break;

						case GAME.props.keycodes.RIGHT: // right
							console.log('RIGHT');
							break;

						case GAME.props.keycodes.DOWN: // down
							console.log('DOWN');
							break;

						default: return; // exit this handler for other keys
					}
					event.preventDefault(); // prevent the default action (scroll / move caret)
				};


				// CreateJS Ticker
				createjs.Ticker.on("tick", GAME.tick);
				GAME.props.now = Date.now();							// Instantiating the 'now'.
				GAME.props.then = createjs.Ticker.now;				// Instantiating the 'then'.


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
				GAME.loadGraphic = new createjs.Shape();
				GAME.loadGraphic.graphics.beginFill("#4385E0").drawCircle(0, 0, 50);
				GAME.loadGraphic.x = 100;
				GAME.loadGraphic.y = 100;
				GAME.stage.addChild(GAME.loadGraphic);
			},
			createObjects: function() {
				/* Make all the stuff that will move around on the stage. */
				/*
				console.log('createObjects()');
				GAME.props.fpsText = new createjs.Text("Hello World", "14px Arial", GAME.props.textColor);
				GAME.props.fpsText.textAlign = "right";
				GAME.props.fpsText.x = GAME.canvas.width - 10;
				GAME.props.fpsText.y = 10;
				GAME.stage.addChild(GAME.props.fpsText);
				*/

				var numFlakes = (GAME.canvas.width/50 * 2) * (GAME.canvas.height/50 * 2);

				for (i = 0; i < numFlakes; i++) {
					// Randomly placed, but no less than 10 pixels from each side.
					var tempX = 10 + ( Math.floor( Math.random() * (GAME.canvas.width - 10) ) ),
						tempY = 10 + ( Math.floor( Math.random() * (GAME.canvas.height - 10) ) ),
						tempRadius = 2 + ( Math.floor( Math.random() * 4 ) ),
						tempResistance = (100 - (Math.floor(Math.random() * 50))) / 100; // Random 5 to 15, from 100, then turned into decimal. Ex .85

					var tempSpeed = (tempRadius - 2) * 10;
					
					// New Snowflake instance.
					//var tempSnowflake = new GAME.snowflake( { context:GAME.context, x:tempX, y:tempY, radius:tempRadius, resistance:tempResistance, speed:tempSpeed } );
					var tempSnowflake = new classes.Snowflake( { canvas:GAME.canvas, id:i, x:tempX, y:tempY, radius:tempRadius, resistance:tempResistance, speed:tempSpeed } );
					GAME.props.snowflakes.push(tempSnowflake);
					GAME.stage.addChild(tempSnowflake);
				}
			}
		},
		tick: function(event) {

			if ( createjs.Ticker.paused === false ) {
				GAME.updateInterval();
				switch(GAME.currentState) {
					case 'INIT':
						//console.log('GAME.tick() - INIT: ' + GAME.currentState);
						GAME.updateloadGraphic(GAME.props.interval);
						break;
					default:
						//console.log('GAME.tick() - READY: ' + GAME.currentState);
						//console.log( 'Time: ' + (GAME.props.now) );
						GAME.updateObjects(GAME.props.interval);
				}
				GAME.stage.update(event); // important!!
			}
		},
		getFPS: function(elapsed) {
			/* Reasons are explained in GAME.setup.addListeners(), but we're going to calculate our own delta values for this animation. */
			var now = createjs.Ticker.getTime(),
				fps = 0;

			var tempFPS = Math.round(1000/(elapsed*1000));
			fps = isFinite(tempFPS) ? tempFPS : 0;

			return fps;
		},
		updateInterval: function() {
			GAME.props.now = Date.now();
			GAME.props.interval = (GAME.props.now - GAME.props.then) / 1000;// seconds since last frame.
			GAME.props.then = GAME.props.now;
		},
		updateloadGraphic : function(elapsed) {
			/* Simple logic to update the loading graphic while the user waits for assets. */
			GAME.loadGraphic.x += elapsed/1000*100;
			if (GAME.loadGraphic.x > GAME.canvas.width) {
				GAME.loadGraphic.x -= GAME.canvas.width;
			}
		},
		updateObjects : function(elapsed) {
			var snowflakesArray = GAME.props.snowflakes;
			//GAME.props.fpsText.text = GAME.getFPS(elapsed);
			// move 100 pixels per second (elapsedTimeInMS / 1000msPerSecond * pixelsPerSecond):
			//if (createjs.Ticker.getTicks() % 20 == 0) {
				//console.log('updateObjects() ticks = ' + createjs.Ticker.getTicks());
			//	GAME.updateCornerText();
			//}

			for(var i=0; i<snowflakesArray.length; i++) {
				//GAME.snowflakes[i].updatePosition(elapsed);

				// vx means "horizontal velocity" and vr means "rotational velocity". Adding them to the x and rotation properties.


				snowflakesArray[i].x += ((GAME.props.wind + snowflakesArray[i].speed) * snowflakesArray[i].resistance) * (elapsed);
				snowflakesArray[i].y += ((GAME.props.gravity + snowflakesArray[i].speed) * snowflakesArray[i].resistance) * (elapsed);


				// Preparing velocities for the next frame.
				//=========================================
				// wrapping from the left wall.
				if ( (snowflakesArray[i].x + snowflakesArray[i].radius) < 0 ) {
					snowflakesArray[i].x = GAME.canvas.width + snowflakesArray[i].radius;
				}
				// wrapping from the right wall.
				if ( (snowflakesArray[i].x - snowflakesArray[i].radius) > GAME.canvas.width ) {
					snowflakesArray[i].x = 0 - snowflakesArray[i].radius;
				}
				// wrapping from the floor.
				if ( (snowflakesArray[i].y + snowflakesArray[i].radius) > GAME.canvas.height+10) {
					snowflakesArray[i].y = -10 - snowflakesArray[i].radius;
				}
			}
		}
	};

	GAME.init('canvasContainer');

})();

