var classes = classes || {}; // Giving a namespace to the class we're creating. It keeps things out of global.

//http://createjs.com/tutorials/Inheritance/
(function() {

	/*
	We're creating a temporary object that lives only during this anonymous setup function. Once it's built up and 
	ready, we will add it to our classes object to be used by an outside application.
	*/

	//function Ship(canvas, id, x, y, vx, vy, vr) {
	function Ship(settings) {
		this.Shape_constructor();
		// Assign properties from what is passed in.
		this.x				= settings.x || 0;
		this.y				= settings.y || 0;
		//this.width		= 30;						// All of our squares will be the same size.
		//this.height		= 30;
		//this.regX			= this.width/2;				// Setting the registration point so we can rotate around the center of the square.
		//this.regY			= this.height/2;
		this.rotation		= -90;						// This is the default value anyway, but I wanted to set it here for readability.
		this.cos			= 1;
		this.sin			= 1;
		this.vx				= 0;
		this.vy				= 0;
		this.vr				= settings.vx || 130;
		this.accel			= 5;
		this.maxVelocity	= 400;
		this.thrust			= false;
		this.turn			= '';

		this.setBounds(  -10, -12, 20, 24 ); 
		//this.graphics.setStrokeStyle(1).beginStroke("rgba(0,0,0,1)").drawCircle(160,60,40);
		//this.graphics.beginStroke("#FFF").beginFill("#bad").drawRect(0, 0, this.width, this.height);
		this.graphics = grShip;
	}

	// extend() builds our temporary object up with the parent as it's prototype. It then returns the new prototype, 
	// so we could give this a shorter variable name if we wanted to.
	Ship.prototype = createjs.extend(Ship, classes.Mover);

	/*
	Now we're actually going to create the class and use it. Any methods we override will be renamed
	to prefix_methodName(), as in: Container_draw(). We're adding the resulting class to our classes
	object to avoid polluting the global namespace.
	*/
	
	classes.Ship = createjs.promote(Ship, classes.Mover);


	var grShip			=	new createjs.Graphics()
								.setStrokeStyle(1)
								.beginFill("#ffffff")
									.drawCircle(0, 0, 2)
								.endFill()
								.beginStroke("#ffffff")
									.moveTo(12,0)
										.lineTo(-12,-10)
										.lineTo(-5,0)
										.lineTo(-12,10)
										.lineTo(12,0);


	var grShipThrust	=	new createjs.Graphics()
								.setStrokeStyle(1)
								.beginFill("#ffffff")
									.drawCircle(0, 0, 2)
								.endFill()
								.beginStroke("#ffffff")
									.moveTo(12,0)
										.lineTo(-12,-10)
										.lineTo(-5,0)
										.lineTo(-12,10)
										.lineTo(12,0)


									.setStrokeStyle(3)
									.moveTo(-10,-3)
										.lineTo(-10,3)
									.setStrokeStyle(2)
									.moveTo(-10,0)
										.lineTo(-16,-0)
									.setStrokeStyle(1)
									.moveTo(-16,-0)
										.lineTo(-20,-0)
									.endStroke();



	Ship.prototype.update = function(elapsed) {
		if (this.thrust === false) {
			this.graphics = grShip;
		} else {

			var radians = this.rotation * Math.PI / 180;
			this.cos = Math.cos(radians);
			this.sin = Math.sin(radians);
			this.graphics = grShipThrust;


			var vxNew = this.vx+this.accel*this.cos,
				vyNew = this.vy+this.accel*this.sin

			var currentVelocity = Math.sqrt ( Math.pow(vxNew, 2) + Math.pow(vyNew, 2) );
			currentVelocity = (currentVelocity > this.maxVelocity) ? this.maxVelocity : currentVelocity;

			this.vx = vxNew;
			this.vy = vyNew;

		}
		if (this.turn === 'right') {
			this.rotation += this.vr * elapsed;
		} else if (this.turn === 'left') {
			this.rotation -= this.vr * elapsed;
		}
		this.x += (this.vx * elapsed);
		this.y += (this.vy * elapsed);
	}






}());