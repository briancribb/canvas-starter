var classes = classes || {}; // Giving a namespace to the class we're creating. It keeps things out of global.

//http://createjs.com/tutorials/Inheritance/
(function() {
	/*
	We're creating a temporary object that lives only during this anonymous setup function. Once it's built up and 
	ready, we will add it to our classes object to be used by an outside application.

	It's important to note that this class is a base class which will act as a prototype for all of the moving objects 
	in the game. All of them will be able to explode, for example, so I wanted that explosion function to be in the 
	prototype so that it would exist just one time in memory.
	*/

	function Mover() {
		/*
		Prototypes are defined below, but all of that will exist when this function is called. Normally we would call 
		this.Shape_constructor() here, but we won't because this is just a base class. It's only purpose is to provide 
		common functions for all moving objects in the tame. Subclasses will call this.Shape_constructor() in their own 
		constructor functions.

		Normally we would assign values for x and y and so on. Not doing that because this is just a base class. This 
		exists only to provide common methods to subsequent classes. 
		*/
	};
	/*
	createjs.extend() builds our temporary object up with the parent as it's prototype. It then returns the new prototype, 
	so we could give this a shorter variable name if we wanted to.
	*/
	Mover.prototype = createjs.extend(Mover, createjs.Shape);

	/*
	Now we're actually going to create the class and use it. Any methods we override will be renamed
	to prefix_methodName(), as in: Container_draw(). We're adding the resulting class to our classes
	object to avoid polluting the global namespace.
	*/
	classes.Mover = createjs.promote(Mover, "Shape");

	Mover.prototype.explode = function() {
		return 'explode: this.x = ' + this.x;
	}

}());