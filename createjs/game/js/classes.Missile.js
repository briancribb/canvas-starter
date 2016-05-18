var classes = classes || {}; // Giving a namespace to the class we're creating. It keeps things out of global.

//http://createjs.com/tutorials/Inheritance/
(function() {
	/*
	We're creating a temporary object that lives only during this anonymous setup function. Once it's built up and 
	ready, we will add it to our classes object to be used by an outside application.
	*/

	//function Missile(canvas, id, x, y, vx, vy, vr) {
	function Missile(settings) {
		this.Shape_constructor();
		// Assign properties from what is passed in.
		this.born			= settings.born;
		this.age			= settings.age;
		this.x				= settings.x			|| 0;
		this.y				= settings.y			|| 0;
		this.radius			= 2;
		this.width			= this.radius*2;
		this.height			= this.radius*2;
		this.regX			= this.width/2;
		this.regY			= this.height/2;

		this.course			= settings.course		|| -90;	// An angle for the missile to travel at.
		this.speed			= 200;
		this.vx				= settings.vx			|| 0;
		this.vy				= settings.vy			|| 0;

		/*
		1.	Get a vector from the missile's default speed and the course that was passed in. The course is the 
			rotation of the ship when the missile is fired.
		2.	The vx and vy from the vector are added to the ones that were passed in from the ship which fired this 
			missile. This way, the missile's speed is added to the ship's current speed.
		*/
		var vector = this.getVelocity(this.course, this.speed);
		this.vx += vector.vx;
		this.vy += vector.vy;


		this.setBounds( this.x, this.y, this.width, this.height ); 
		this.graphics
			.beginFill("#ffffff")
				.drawCircle(this.regX,this.regY,this.radius)
			.endFill(); 
	}

	// extend() builds our temporary object up with the parent as it's prototype. It then returns the new prototype, 
	// so we could give this a shorter variable name if we wanted to.
	Missile.prototype = createjs.extend(Missile, classes.Mover);

	/*
	Now we're actually going to create the class and use it. Any methods we override will be renamed
	to prefix_methodName(), as in: Container_draw(). We're adding the resulting class to our classes
	object to avoid polluting the global namespace.
	*/
	classes.Missile = createjs.promote(Missile, classes.Mover);


	Missile.prototype.update = function(elapsed) {
		//console.log('this.vx: ' + this.vx);
		this.x += (this.vx * elapsed);
		this.y += (this.vy * elapsed);
		this.age = ( Date.now() ) - this.born;
	}
}());