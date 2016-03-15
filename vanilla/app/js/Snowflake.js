/* Snowflake class. Well, object really, since JavaScript doesn't really have classes. But we're going to call them classes anyway, so just relax. */
APP.snowflake = function(settings) {
	this.context = settings.context;
	this.x = settings.x || 30;
	this.y = settings.y || 30;
	this.radius = settings.radius || 10;
	this.resistance = settings.resistance || 1;
	this.speed = settings.speed || 0;
	this.velocityx = 0;
	this.velocityy = 0;
};

APP.snowflake.prototype.drawSelf = function () {
	// draw the Snowflake in its new position.
	this.context.fillStyle = "#ffffff";
	this.context.beginPath();
	this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
	this.context.closePath();
	this.context.fill();
};

APP.snowflake.prototype.updatePosition = function () {
	// Not using velocity because this assumes that snowflakes have reached top speed against air resistance by now.
	this.x += ((APP.props.wind + this.speed) * this.resistance) * APP.core.interval;
	this.y += ((APP.props.gravity + this.speed) * this.resistance) * APP.core.interval;

	// Preparing velocities for the next frame.
	//=========================================
	// wrapping from the left wall.
	if ( (this.x + this.radius) < 0 ) {
		this.x = APP.canvas.width + this.radius;
	}
	// wrapping from the right wall.
	if ( (this.x - this.radius) > APP.canvas.width ) {
		this.x = 0 - this.radius;
	}
	// wrapping from the floor.
	if ( (this.y + this.radius) > APP.canvas.height+10) {
		this.y = -10 - this.radius;
	}
};
