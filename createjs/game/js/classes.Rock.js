var classes = classes || {}; // Giving a namespace to the class we're creating. It keeps things out of global.

//http://createjs.com/tutorials/Inheritance/
(function() {

	/*
	We're creating a temporary object that lives only during this anonymous setup function. Once it's built up and 
	ready, we will add it to our classes object to be used by an outside application.
	*/

	//function Rock(canvas, id, x, y, vx, vy, vr) {
	function Rock(settings) {
		this.Shape_constructor();
		// Assign properties from what is passed in.
		this.x				= settings.x || 0;
		this.y				= settings.y || 0;
		this.size			= settings.size || 'large';
		this.width			= this.sizes[this.size];				// All of our squares will be the same size.
		this.height			= this.sizes[this.size];
		this.regX			= this.width/2;							// Setting the registration point so we can rotate around the center of the square.
		this.regY			= this.height/2;
		this.radius			= this.width/2;
		this.rotation		= Math.floor( Math.random() * (360) );
		this.vr				= settings.vr || 20;

		settings.course		= settings.course || Math.floor( Math.random() * 360 );					// An angle for the rock to travel at.
		settings.speed		= settings.speed + this.speedMods[this.size] || 40;

		var vector = this.getVelocity(settings.course, settings.speed);
		//console.log(vector);
		this.vx = vector.vx;
		this.vy = vector.vy;

		this.setBounds( 0, 0, this.width, this.height ); 
		this.graphics
			.setStrokeStyle(1.5)
				.beginStroke("#ffffff")
				//.drawRect(0,0,20,20)
				.drawRect(0,0,this.width,this.height)
			.endStroke(); 

		//console.log('this.sizes.large = ' + this.sizes.large);
	}

	// extend() builds our temporary object up with the parent as it's prototype. It then returns the new prototype, 
	// so we could give this a shorter variable name if we wanted to.
	Rock.prototype = createjs.extend(Rock, classes.Mover);

	/*
	Now we're actually going to create the class and use it. Any methods we override will be renamed
	to prefix_methodName(), as in: Container_draw(). We're adding the resulting class to our classes
	object to avoid polluting the global namespace.
	*/
	classes.Rock = createjs.promote(Rock, classes.Mover);


	Rock.prototype.sizes = {
		large:	55,
		medium:	30,
		small:	15
	}
	Rock.prototype.speedMods = {
		large:	0,
		medium:	20,
		small:	40
	}

	Rock.prototype.update = function(elapsed) {
		//console.log('this.vx: ' + this.vx);
		this.x += (this.vx * elapsed);
		this.y += (this.vy * elapsed);
		this.rotation += (this.vr * elapsed);
	}

}());