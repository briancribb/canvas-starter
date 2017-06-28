/*
INSPIRATIONS:
Structure inspired by:
	http://viget.com/extend/2666
Page Visibility API and Polyfill for vendor prefixes:
	http://stackoverflow.com/questions/1060008/is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active
	http://www.w3.org/TR/page-visibility/
	http://caniuse.com/#feat=pagevisibility
	http://jsfiddle.net/0GiS0/cAG5N/
	https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
	https://codepen.io/jakealbaugh/post/canvas-image-pixel-manipulation
*/

var APP = {
	states: {
		INIT: "INIT",
		READY: "READY"
	},
	currentState: 'INIT',
	layers:{},
	props: {
		now:null,				// "now" and "then" get initial values in APP.setup.addListeners().
		then:null,
		interval:0,
		width:500,				// Width of our canvas app. Used when creating the canvas and testing its bounds.
		height:375,				// Height of our canvas app.
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
			{id:"gradient-left", src:"img/gradient-left.png"},
			{id:"gradient-right", src:"img/gradient-right.png"},
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
		APP.queue = new createjs.LoadQueue(true);
		APP.queue.loadManifest(APP.props.assets);
		APP.queue.on("fileload", handleFileLoad, this);
		APP.queue.on("complete", handleComplete, this);

		function handleFileLoad(event) {
			console.log('handleFileLoad()');
			console.log(event);

			for (var i = 0; i < APP.props.assets.length; i++) {
				if ( APP.props.assets[i].id === event.item.id) {
					APP.props.assets[i].width = event.result.width;
					APP.props.assets[i].height = event.result.height;
				}
				
			};
			// Add any images to the page body. Just a temporary thing for testing.
			//if (event.item.type === createjs.LoadQueue.IMAGE) {
			//	document.body.appendChild(event.result);
			//}
		}
		function handleComplete(event) {
			console.log('handleComplete()');
			console.log(event);
			/* Once assets are loaded, run the rest of the app. */
			APP.setup.createObjects();
			APP.play();
			APP.stage.removeChild(APP.loadGraphic);
			APP.currentState = APP.states.READY;
		}
	},
	setup: {
		createCanvas: function(targetID) {
			APP.canvas = document.getElementById('base');
			APP.canvas.context = APP.canvas.getContext('2d');

			APP.cnvGL = document.getElementById('gradient-left');
			APP.cnvGL.context = APP.cnvGL.getContext('2d');

			APP.cnvGR = document.getElementById('gradient-right');
			APP.cnvGR.context = APP.cnvGR.getContext('2d');

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


			// COLOR PICKER CODE: http://jscolor.com/
			document.getElementById('color-picker-left').addEventListener('change', function(event) {
				APP.changeColor(event.target.value, 'left');
			});

			document.getElementById('color-picker-right').addEventListener('change', function(event) {
				APP.changeColor(event.target.value, 'right');
			});



			// http://stackoverflow.com/questions/1402698/binding-arrow-keys-in-js-jquery
			document.onkeydown = function(event) {
				event = event || window.event;
				switch(event.which || event.keyCode) {
					case APP.props.keycodes.SPACE: // left
						//console.log('SPACE');
						if (createjs.Ticker.getPaused() === true) {
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

			var layers = APP.layers;
			layers.gradLeft = new createjs.Bitmap(APP.queue.getResult('gradient-left'));
			layers.gradRight = new createjs.Bitmap(APP.queue.getResult('gradient-right'));
			layers.curiosity = new createjs.Bitmap(APP.queue.getResult('curiosity'));


			layers.gradLeft.draw(APP.cnvGL.context);
			layers.gradRight.draw(APP.cnvGR.context);




			//layers.gradRight.x = layers.gradRight.regX = layers.gradRight.image.width/1.5;
			//layers.gradRight.y = layers.gradRight.regY = layers.gradRight.image.height/2;
			//layers.gradRight.rotation = 180;


			//layers.gradLeft.scaleX = layers.gradRight.scaleX = .5;
			//layers.gradLeft.alpha = layers.gradRight.alpha = .75;



			var ratio = APP.canvas.width / layers.curiosity.image.width;
			layers.curiosity.scaleX = layers.curiosity.scaleY = ratio;



			// Add things to the stage.
			//APP.stage.addChild(layers.curiosity, layers.gradLeft, layers.gradRight);
			APP.stage.addChild(layers.curiosity);
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
		//console.log('updateObjects()');
		//APP.stage.children[0].x ++;

	},
	hexToRgb : function(hex) {
		var bigint = parseInt(hex, 16);
		var r = (bigint >> 16) & 255;
		var g = (bigint >> 8) & 255;
		var b = bigint & 255;

		//return r + "," + g + "," + b;
		return {r:r, g:g, b:b};
	},
	changeColor : function(hex, side) {
		var color = APP.hexToRgb(hex),
			//source = (side === 'right') ? APP.layers.gradRight : APP.layers.gradLeft ;
			target = (side && side === 'right') ? APP.cnvGR : APP.cnvGL ;

		var imageData = target.context.getImageData(0,0,target.width,target.height)
		var data = imageData.data;

		for (var i = 0; i < data.length; i += 4) {
			data[i]     = color.r;     // red
			data[i + 1] = color.g; // green
			data[i + 2] = color.b; // blue
		}
		target.context.putImageData(imageData, 0, 0);
	}
};

APP.init('canvasContainer');




/*
	changeColor : function(hex) {
		console.log('changeColor()');
		APP.cnvGR.width = APP.cnvGR.width;

		var color = APP.hexToRgb(hex),
			contextBG = APP.cnvGR.context;

		APP.layers.gradLeft.draw(APP.cnvGR.context);

		var imageData = contextBG.getImageData(0,0,APP.cnvGR.width,APP.cnvGR.height)

		var data = imageData.data;


		for (var i = 0; i < data.length; i += 4) {
			data[i]     = color.r;     // red
			data[i + 1] = color.g; // green
			data[i + 2] = color.b; // blue
		}
		APP.cnvGR.context.putImageData(imageData, 0, 0);
	}
*/















