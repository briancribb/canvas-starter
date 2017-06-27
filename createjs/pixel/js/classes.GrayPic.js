var classes = classes || {}; // Giving a namespace to the class we're creating. It keeps things out of global.

//http://createjs.com/tutorials/Inheritance/
(function() {

	/*
	We're creating a temporary object that lives only during this anonymous setup function. Once it's built up and 
	ready, we will add it to our classes object to be used by an outside application.
	*/

	//function GrayPic(canvas, id, x, y, vx, vy, vr) {
	function GrayPic(settings) {
		console.log('GrayPic()');
		this.Bitmap_constructor(settings.src);
		// Assign properties from what is passed in.
		//this.canvas		= settings.canvas;			// We could just use "stage", but I like writing things in a similar pattern.
		this.id			= settings.id;				// Optional number id for the Bitmap, not to be confused with the HTML id attribute.
			this.name	= "GrayPic_" + this.id;	// We can also give it a text name. Remember this from ActionScript?
		this.x			= settings.x;
		this.y			= settings.y;

		this.width		= settings.width || 300;						// All of our squares will be the same size.
		this.height		= settings.height || 300;

	}

	// extend() builds our temporary object up with the parent as it's prototype. It then returns the new prototype, 
	// so we could give this a shorter variable name if we wanted to.
	GrayPic.prototype = createjs.extend(GrayPic, createjs.Bitmap);

	GrayPic.prototype.method = function() {

	}


	/*
	Now we're actually going to create the class and use it. Any methods we override will be renamed
	to prefix_methodName(), as in: Container_draw(). We're adding the resulting class to our classes
	object to avoid polluting the global namespace.
	*/
	
	classes.GrayPic = createjs.promote(GrayPic, "Bitmap");
}());