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
		this.x				= settings.x || 0;
		this.y				= settings.y || 0;
		this.radius			= 2;
		this.width			= this.radius*2;					// All of our squares will be the same size.
		this.height			= this.radius*2;
		this.regX			= this.width/2;							// Setting the registration point so we can rotate around the center of the square.
		this.regY			= this.height/2;

		this.course			= settings.course		|| -90;					// An angle for the rock to travel at.
		this.speed			= settings.speed + 100	|| 100;
		this.vx				= settings.vx || 0;
		this.vy				= settings.vy || 0;



		//var vector = this.getVelocity(this.course, this.speed);
		//console.log(vector);
		//this.vx = vector.vx;
		//this.vy = vector.vy;

		this.setBounds( this.x, this.y, this.width, this.height ); 
		this.graphics
			.beginFill("#ffffff")
				//.drawRect(0,0,20,20)
				.drawCircle(this.regX,this.regY,this.radius)
			.endFill(); 

		//console.log('this.sizes.large = ' + this.sizes.large);
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
		this.rotation += (this.vr * elapsed);
	}

}());