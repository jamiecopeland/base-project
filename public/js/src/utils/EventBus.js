define(['underscore', 'backbone'], function(_, Backbone) {
	// EventBus acts as a global Events dispatcher, allowing you to communicate across modules
	// In effect it's a singleton, instantiated the first time it's included via requirejs
	//
	// Usage: add it as a requirejs dependency, then simply use it like a regular Backbone event object:
	//
	// EventBus.on('myevent', this.onMyEvent, this);
	// EventBus.trigger('myevent', 'param1', 2, 'etc');
	
	return _.extend({}, Backbone.Events);
});
