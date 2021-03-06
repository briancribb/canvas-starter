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
//(function(){
	/*
	I like the object structure, but I dont want to expose the game to the console. So I'm putting the whole thing 
	into a closure. 
	*/

	var GAME = {
		props: {
			now:null,				// "now" and "then" get initial values in GAME.setup.addListeners().
			then:null,
			width:600,				// Width of our canvas app. Used when creating the canvas and testing its bounds.
			height:400,				// Height of our canvas app.
			textColor: '#FFFD8A',
			keycodes: {
				p:		80,
				n:		78,
				SPACE:	32,
				LEFT:	37,
				RIGHT:	39,
				UP:		38,
				DOWN:	40
			},
			handlers: {
				onkeydown:function(){return;},
				onkeyup:function(){return;}
			},
			assets: [
				{id:"codeschool_logo", src:"img/2014_09_16_20_43_07_Logo-horizontal.png"}
			],
		},
		score: {
			total:	0,
			small:	10,
			medium:	20,
			large:	30
		},
		displayText :  {
			fps: {},
			level: {},
			score: {},
			ships: {}
		},
		ship : {},
		numShips : 3,
		rocks : [],
		saucers : [],
		missiles : [],
		missileLife: 1000,
		particles : [],
		enemyMissiles : [],
		level:{
			current:0,
			maxRocks:20,
			rockBaseSpeed: 40,
			rockSpeedMod: 10,
			maxMissiles: 6,
			missileSpeed: 150,
			knobs: {
				numRocks: 2,
				rockSpeed:5
			}
		},
		pause: function() {
			createjs.Ticker.paused = true;
		},
		play: function() {
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

			GAME.state.swap('LOADING', true);

			function handleFileLoad(event) {
				// Add any images to the page body. Just a temporary thing for testing.
				if (event.item.type === createjs.LoadQueue.IMAGE) {
					//event.result.classList = 'center';
					event.result.classList = 'centered';
					document.body.appendChild(event.result);
				}
			}
			function handleComplete(event) {
				/* Once assets are loaded, run the rest of the app. */
				GAME.play();
				GAME.stage.removeChild(GAME.loadGraphic);
				GAME.state.swap('TITLE');
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
					}
				});


				// http://stackoverflow.com/questions/1402698/binding-arrow-keys-in-js-jquery
				document.onkeydown = function(event) {
					GAME.props.handlers.onkeydown( event || window.event );
					event.preventDefault(); // prevent the default action (scroll / move caret)
				};
				document.onkeyup = function(event) {
					GAME.props.handlers.onkeyup( event || window.event );
					event.preventDefault(); // prevent the default action (scroll / move caret)
				};


				// CreateJS Ticker
				createjs.Ticker.on("tick", GAME.tick);
				GAME.props.now = Date.now();					// Instantiating the 'now'.
				GAME.props.then = createjs.Ticker.now;			// Instantiating the 'then'.


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
				/* Some small animation that does not require external assets. This will play until the all of assets in the manifest are loaded. */
				GAME.loadGraphic = new createjs.Shape();
				GAME.loadGraphic.graphics.beginFill("#4385E0").drawCircle(0, 0, 50);
				GAME.loadGraphic.x = 100;
				GAME.loadGraphic.y = 100;
				GAME.stage.addChild(GAME.loadGraphic);
			}
		},
		tick: function(event) {
			if ( createjs.Ticker.paused === false ) {
				//GAME.updateInterval();
				GAME.state.current.frame( GAME.updateInterval() );
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
			var interval = (GAME.props.now - GAME.props.then) / 1000;// seconds since last frame.
			GAME.props.then = GAME.props.now;
			return interval;
		},
		utils: {
			resetListeners: function() {
				GAME.props.handlers.onkeydown = function(){return;};
				GAME.props.handlers.onkeyup = function(){return;};
			},
			updateRocks: function( elapsed ) {
				for (var i = 0; i < GAME.rocks.length; i++) {
					GAME.rocks[i].update(elapsed);
				};
			},
			updateMissiles: function( elapsed ) {
				for (var i = 0; i < GAME.missiles.length; i++) {
					if ( GAME.missiles[i].age > GAME.missileLife ) {
						GAME.stage.removeChild(GAME.missiles[i]);
						GAME.missiles.splice(i,1);
					} else {
						GAME.missiles[i].update(elapsed);
					}
				};
			},
			updateText: function( elapsed ) {
				console.log('updateText()');
				//if (createjs.Ticker.getTicks() % 20 == 0) {
				//	GAME.displayText.fps.text = GAME.getFPS(elapsed);
				//}
				GAME.displayText.level.text = 'Level: ' + GAME.level.current;
				GAME.displayText.score.text = 'Score: ' + GAME.score.total;
				GAME.displayText.ships.text = 'Ships: ' + GAME.numShips;
			},
			addRocks: function( numRocks, settings ) {
				var settings = settings || {};
				for (var i = 0; i < numRocks; i++) {

					var tempRock = new classes.Rock({
						x:		settings.x		|| 10 + ( Math.floor( Math.random() * (GAME.canvas.width - 10) ) ),
						y:		settings.y		|| 10 + ( Math.floor( Math.random() * (GAME.canvas.height - 10) ) ),
						course:	settings.course	|| Math.floor( Math.random() * 360 ),
						speed:	settings.speed	|| GAME.level.rockBaseSpeed + GAME.level.knobs.rockSpeed,
						size:	settings.size	|| 'large'
					});
					GAME.stage.addChild(tempRock);
					GAME.rocks.push(tempRock);
				};
			},
			hitTestBox: function(object1, object2) {

				var bounds1		= object1.getTransformedBounds(),
					bounds2		= object2.getTransformedBounds();

				var left1		= bounds1.x,
					left2		= bounds2.x,
					right1		= bounds1.x + bounds1.width,
					right2		= bounds2.x + bounds2.width,
					top1		= bounds1.y,
					top2		= bounds2.y,
					bottom1		= bounds1.y + bounds1.height,
					bottom2		= bounds2.y + bounds2.height;


				if (bottom1 < top2) return(false);
				if (top1 > bottom2) return(false);

				if (right1 < left2) return(false);
				if (left1 > right2) return(false);

				return(true);
			},
			hitTestDistance: function(object1, object2) {
				var bounds1		= object1.getTransformedBounds(),
					bounds2		= object2.getTransformedBounds();

				var dx = (bounds2.x + object2.regX) - (bounds1.x + object1.regX),
					dy = (bounds2.y + object2.regY) - (bounds1.y + object1.regY),
					dist = Math.sqrt(dx * dx + dy * dy);

				if ( dist < object1.radius + object2.radius ) {
					return true;
				}
				return false;
			},
			checkHits: function() {
				rocks: for (var i = GAME.rocks.length - 1; i >= 0; i--) {

					var settings = null;

					if ( GAME.missiles.length > 0 ) {

						// Check against all missiles
						missiles: for (var j = GAME.missiles.length - 1; j >= 0; j--) {
							if ( GAME.utils.hitTestDistance( GAME.rocks[i], GAME.missiles[j] ) ) {

								// Capture settings of the rock.
								settings = breakRockSettings( GAME.rocks[i] );

								// Remove the rock before adding any others.
								GAME.score.total += GAME.score[GAME.rocks[i].size];
								GAME.stage.removeChild(GAME.rocks[i]);
								GAME.stage.removeChild(GAME.missiles[j]);
								GAME.rocks.splice(i, 1);
								GAME.missiles.splice(j, 1);

								// If we have rock settings, add two more.
								if (settings) {
									GAME.utils.addRocks( 2, settings );
								}

								break rocks;
								break missiles;
							}
						};
					}

					// Check the current rock against the ship
					if ( GAME.utils.hitTestDistance( GAME.rocks[i], GAME.ship ) && GAME.ship.ready === true ) {

						// Capture settings of the rock.
						settings = breakRockSettings( GAME.rocks[i] );

						GAME.stage.removeChild(GAME.rocks[i]);
						GAME.rocks.splice(i, 1);
						if (settings) {
							GAME.utils.addRocks( 2, settings );
						}

						GAME.state.swap('PLAYER_DIE', true);

						break rocks;
					}




					function breakRockSettings(rock) {
						var settings = null;
						if (rock.size !== 'small') {
							settings = {
								x: rock.x,
								y: rock.y,
								size : (rock.size === 'large') ? 'medium' : 'small'
							}
						}
						return settings;
					}
				};
			},
			wrapObjects: function(wrapArray) {
				for (var i = 0; i < wrapArray.length; i++) {
					var item = wrapArray[i];

					// Wrap vertically
					if ( item.y < (0 - item.height) ) {
						item.y = GAME.canvas.height + 10;
					} else if ( item.y > GAME.canvas.height + 10 ) {
						item.y = 0 - item.height;
					}

					// Wrap horizontally
					if ( item.x > GAME.canvas.width + item.width ) {
						item.x = -10 - item.width;
					} else if ( item.x < -10 - item.width ) {
						item.x = GAME.canvas.width;
					}
				};
			}
		},
		state: {
			current				: null,
			//update			: null,
			swap : function(newState, init){
				if (init !== true) {
					GAME.utils.resetListeners();
					GAME.state.current.cleanup();
				}
				GAME.state.current = GAME.state[newState];
				GAME.state.current.setup();
			},
			LOADING : {
				setup : function(elapsed){
					// Any one-time tasks that happen when we switch to this state.
				},
				frame : function(elapsed){
					// State function to run on each tick.
					/* Simple logic to update the loading graphic while the user waits for assets. */
					GAME.loadGraphic.x += elapsed/1000*100;
					if (GAME.loadGraphic.x > GAME.canvas.width) {
						GAME.loadGraphic.x -= GAME.canvas.width;
					}
				},
				cleanup : function(elapsed){
				}
			},
			TITLE : {
				setup : function(elapsed){
					GAME.props.handlers.onkeyup = function(event) {
						switch(event.which || event.keyCode) {
							case GAME.props.keycodes.SPACE: // left
								GAME.state.swap('NEW_GAME');
								break;

							default: return; // exit this handler for other keys
						}
					}

					/* Creating the title screen. */
					var title = new createjs.Text( 'Asteroids Example Type Game', '18px Arial', '#ffffff' );
					title.textAlign = "center";
					title.x = GAME.canvas.width/2;
					title.y = GAME.canvas.height/2 - 20;
					title.name = 'title';
					GAME.stage.addChild(title);

					var subtitle = new createjs.Text( 'Press spacebar to continue...', '12px Arial', '#ffffff' );
					subtitle.textAlign = "center";
					subtitle.x = GAME.canvas.width/2;
					subtitle.y = GAME.canvas.height/2 + 10;
					subtitle.name = 'subtitle';
					GAME.stage.addChild(subtitle);
				},
				frame : function(elapsed){
					// State function to run on each tick.
					GAME.utils.updateText();
				},
				cleanup : function(elapsed){
					// Remove the title stuff, but leave the score.
					GAME.stage.removeChild( GAME.stage.getChildByName('title') );
					GAME.stage.removeChild( GAME.stage.getChildByName('subtitle') );
				}
			},
			// Sets defaults to zero and clears everything out.
			NEW_GAME : {
				setup : function(){
					// Any one-time tasks that happen when we switch to this state.
					GAME.level.current = 0;
					GAME.numShips = 3;
					GAME.ship = null;
					GAME.ship = new classes.Ship({
						x:GAME.canvas.width/2, 
						y:GAME.canvas.height/2
					});

					/* Make all the stuff that will always remain on the stage.
					GAME.displayText.fps = new createjs.Text("FPS", "14px Arial", GAME.props.textColor);
					GAME.displayText.fps.textAlign = "right";
					GAME.displayText.fps.x = GAME.canvas.width - 10;
					GAME.displayText.fps.y = 10;
					GAME.displayText.fps.name = 'txtFPS';
					GAME.stage.addChild(GAME.displayText.fps); */

					/* Make all the stuff that will always remain on the stage. */
					GAME.displayText.level = new createjs.Text("Level: " + GAME.level.current, "14px Arial", GAME.props.textColor);
					GAME.displayText.level.textAlign = "right";
					GAME.displayText.level.x = GAME.canvas.width - 10;
					GAME.displayText.level.y = 10;
					GAME.displayText.level.name = 'txtLevel';
					GAME.stage.addChild(GAME.displayText.level);

					GAME.displayText.score = new createjs.Text( 'Score: ' + GAME.score.total, '14px Arial', GAME.props.textColor );
					GAME.displayText.score.textAlign = "left";
					GAME.displayText.score.x = 10;
					GAME.displayText.score.y = 10;
					GAME.displayText.score.name = 'txtScore';
					GAME.stage.addChild(GAME.displayText.score);

					GAME.displayText.ships = new createjs.Text( 'Ships: ' + GAME.numShips, '14px Arial', GAME.props.textColor );
					GAME.displayText.ships.textAlign = "center";
					GAME.displayText.ships.x = GAME.canvas.width/2;
					GAME.displayText.ships.y = 10;
					GAME.displayText.ships.name = 'txtShips';
					GAME.stage.addChild(GAME.displayText.ships);

				},
				frame : function(elapsed){
					GAME.state.swap('NEW_LEVEL');
				},
				cleanup : function(){
				}
			},
			// Sets the level knobs and populates the screen with rocks
			NEW_LEVEL : {
				setup : function(){
					// Any one-time tasks that happen when we switch to this state.
					GAME.level.current ++;
					GAME.utils.addRocks( GAME.level.current + GAME.level.knobs.numRocks );
				},
				frame : function(elapsed){
					GAME.state.swap('PLAYER_START');
				},
				cleanup : function(){
				}
			},
			// Fades the player ship in from zero to full
			PLAYER_START : {
				setup : function(){
					// Any one-time tasks that happen when we switch to this state.
					GAME.stage.addChild( GAME.ship );
					GAME.utils.updateText();
				},
				frame : function(elapsed){

					GAME.ship.fadeIn(elapsed);
					GAME.utils.updateMissiles(elapsed);
					GAME.utils.updateRocks(elapsed);
					GAME.utils.checkHits();

					if (GAME.ship.ready === true) {
						GAME.state.swap('PLAY_LEVEL');
					}
				},
				cleanup : function(){
				}
			},
			// Everything is active and the player can play
			PLAY_LEVEL : {
				setup : function(){
					// Any one-time tasks that happen when we switch to this state.
					GAME.props.handlers.onkeydown = function(event) {
						switch(event.which || event.keyCode) {
							case GAME.props.keycodes.p: // p
								if (createjs.Ticker.getPaused() === true) {
									GAME.play();
								} else {
									GAME.pause();
								}
								break;

							case GAME.props.keycodes.LEFT: // left
								if (GAME.ship.ready) {
									GAME.ship.turn = 'left';
								}
								break;

							case GAME.props.keycodes.UP: // up
								if (GAME.ship.ready) {
									GAME.ship.thrust = true;
								}
								break;

							case GAME.props.keycodes.RIGHT: // right
								if (GAME.ship.ready) {
									GAME.ship.turn = 'right';
								}
								break;

							case GAME.props.keycodes.DOWN: // down
								break;

							case GAME.props.keycodes.SPACE: // down
								if (GAME.ship.ready === true && GAME.missiles.length < 8) {
									var tempVector = GAME.ship.getVector(
										GAME.ship.vx,
										GAME.ship.vy
									);

									var tempMissile = new classes.Missile({
										x:		GAME.ship.x, 
										y:		GAME.ship.y,
										vx: 	GAME.ship.vx,
										vy: 	GAME.ship.vy,
										course:	GAME.ship.rotation,
										born:	GAME.props.now
									});
									GAME.missiles.push(tempMissile);
									GAME.stage.addChild(tempMissile);
								}
								break;

							default: return; // exit this handler for other keys
						}
					}
					GAME.props.handlers.onkeyup = function(event) {
						switch(event.which || event.keyCode) {
							case GAME.props.keycodes.UP: // up
								GAME.ship.thrust = false;
								break;

							case GAME.props.keycodes.LEFT: // left
								GAME.ship.turn = '';
								break;

							case GAME.props.keycodes.RIGHT: // right
								GAME.ship.turn = '';
								break;

							default: return; // exit this handler for other keys
						}
					}
				},
				frame : function(elapsed){
					//GAME.displayText.fps.text = GAME.getFPS(elapsed);

					// move 100 pixels per second (elapsedTimeInMS / 1000msPerSecond * pixelsPerSecond):
					GAME.ship.update(elapsed);
					GAME.utils.updateMissiles(elapsed);
					GAME.utils.updateRocks(elapsed);
					GAME.utils.wrapObjects(GAME.stage.children);
					GAME.utils.checkHits();

					GAME.utils.updateText();

					if ( GAME.rocks.length === 0 && GAME.ship.ready === true ) {
						GAME.state.swap('NEW_LEVEL');
					}
				},
				cleanup : function(){
				}
			},
			// The player ship blows up and returns to PLAYER_START, if the player has ships.
			PLAYER_DIE : {
				setup : function(){
					GAME.numShips --;
					if (GAME.numShips < 1) {
						GAME.stage.removeChild(GAME.ship);
						GAME.state.swap('GAME_OVER');
					} else {
						GAME.state.swap('PLAYER_START');
					}
				},
				frame : function(elapsed){
					GAME.utils.updateText();
				},
				cleanup : function(){
					GAME.ship.reset();
				}
			},
			// The player is out of ships, so display the final score.
			GAME_OVER : {
				setup : function(){


					GAME.props.handlers.onkeyup = function(event) {
						switch(event.which || event.keyCode) {
							case GAME.props.keycodes.n: // left
								GAME.state.swap('NEW_GAME');
								break;

							default: return; // exit this handler for other keys
						}
					}


					if (GAME.rocks.length > 0) {
						for (var i = GAME.rocks.length - 1; i >= 0; i--) {
							GAME.stage.removeChild(GAME.rocks[i]);
							GAME.rocks.splice(i, 1);
						};
					}
					if (GAME.missiles.length > 0) {
						for (var i = GAME.missiles.length - 1; i >= 0; i--) {
							GAME.stage.removeChild(GAME.missiles[i]);
							GAME.missiles.splice(i, 1);
						};
					}


					/* Creating the title screen. */
					var title = new createjs.Text( 'GAME OVER', '24px Arial', '#ffffff' );
					title.textAlign = "center";
					title.x = GAME.canvas.width/2;
					title.y = GAME.canvas.height/2 - 20;
					title.name = 'title';
					GAME.stage.addChild(title);

					var subtitle = new createjs.Text( "Hit the 'n' for a new game.", '12px Arial', '#ffffff' );
					subtitle.textAlign = "center";
					subtitle.x = GAME.canvas.width/2;
					subtitle.y = GAME.canvas.height/2 + 10;
					subtitle.name = 'subtitle';
					GAME.stage.addChild(subtitle);

				},
				frame : function(elapsed){
					GAME.utils.updateText();
				},
				cleanup : function(){
					GAME.stage.removeAllChildren();
				}
			}
		}
	};

	GAME.init('canvasContainer');
//})();

