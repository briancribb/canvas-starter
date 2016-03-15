var classes = classes || {}; // Giving a namespace to the class we're creating. It keeps things out of global.

//http://createjs.com/tutorials/Inheritance/
(function() {

	/*
	We're creating a temporary object that lives only during this anonymous setup function. Once it's built up and 
	ready, we will add it to our classes object to be used by an outside application.
	*/

	//function Snowflake(canvas, id, x, y, vx, vy, vr) {
	function Snowflake(settings) {
		this.Shape_constructor();
		// Assign properties from what is passed in.
		this.canvas		= settings.canvas;			// We could just use "stage", but I like writing things in a similar pattern.
		this.id			= settings.id;				// Optional number id for the Shape, not to be confused with the HTML id attribute.
			this.name	= "Snowflake_" + this.id;	// We can also give it a text name. Remember this from ActionScript?
		this.x			= settings.x;
		this.y			= settings.y;
		this.radius		= settings.radius;
		this.resistance = settings.resistance;
		this.speed		= settings.speed;
		//this.width		= 30;						// All of our squares will be the same size.
		//this.height		= 30;
		//this.regX		= this.width/2;				// Setting the registration point so we can rotate around the center of the square.
		//this.regY		= this.height/2;
		//this.rotation	= 0;						// This is the default value anyway, but I wanted to set it here for readability.

		//console.log('this.resistance = ' + this.resistance);
		//console.log('this.speed = ' + this.speed);

		//this.graphics.setStrokeStyle(1).beginStroke("rgba(0,0,0,1)").drawCircle(160,60,40);
		//this.graphics.beginStroke("#FFF").beginFill("#bad").drawRect(0, 0, this.width, this.height);
		this.graphics.beginFill("#ffffff").drawCircle(0, 0, this.radius);
	}

	// extend() builds our temporary object up with the parent as it's prototype. It then returns the new prototype, 
	// so we could give this a shorter variable name if we wanted to.
	Snowflake.prototype = createjs.extend(Snowflake, createjs.Shape);



	/*
	Now we're actually going to create the class and use it. Any methods we override will be renamed
	to prefix_methodName(), as in: Container_draw(). We're adding the resulting class to our classes
	object to avoid polluting the global namespace.
	*/
	
	classes.Snowflake = createjs.promote(Snowflake, "Shape");

}());