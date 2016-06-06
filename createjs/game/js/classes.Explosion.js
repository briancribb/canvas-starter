var classes = classes || {}; // Giving a namespace to the class we're creating. It keeps things out of global.

//http://createjs.com/tutorials/Inheritance/
(function() {

	/*
	We're creating a temporary object that lives only during this anonymous setup function. Once it's built up and 
	ready, we will add it to our classes object to be used by an outside application.
	*/

	//function Explosion(canvas, id, x, y, vx, vy, vr) {
	function Explosion(settings) {
		this.Shape_constructor();
		// Assign properties from what is passed in.
		this.x				= settings.x || 0;
		this.y				= settings.y || 0;
		this.particles		= [];


		var numParticles = Math.floor( Math.random() * 30 ) + 30;

   		for (var i = 0; i < numParticles; i++) {
			var course = Math.floor( Math.random() * 360 ),
				speed = Math.floor( Math.random() * 300 );
			this.particles.push( this.getVelocity(course, speed) );
		};

		console.log(this.particles);




		//this.graphics = grExplosion;
	}

	// extend() builds our temporary object up with the parent as it's prototype. It then returns the new prototype, 
	// so we could give this a shorter variable name if we wanted to.
	Explosion.prototype = createjs.extend(Explosion, classes.Mover);

	/*
	Now we're actually going to create the class and use it. Any methods we override will be renamed
	to prefix_methodName(), as in: Container_draw(). We're adding the resulting class to our classes
	object to avoid polluting the global namespace.
	*/
	
	classes.Explosion = createjs.promote(Explosion, classes.Mover);


	var grExplosion			=	new createjs.Graphics()
								.setStrokeStyle(1)
								.beginFill("#ffffff")
									.drawCircle(12, 10, 2)
								.endFill()
								.beginStroke("#ffffff")
									.moveTo(24,10)
										.lineTo(0,0)
										.lineTo(7,10)
										.lineTo(0,20)
										.lineTo(24,10);



	Explosion.prototype.update = function(elapsed) {

	}

}());