define([
	'underscore',
	'backbone',
	'utils/EventBus',
	'config/StatefulRouter'
], function(
	_,
	Backbone,
	EventBus,
	StatefulRouter
) {
	

	var Router = StatefulRouter.extend({
		
		start: function(rootView)
		{
			this.rootView = rootView;
			Backbone.history.start({pushState: false});
		},

		routes:
		{
			'home':
			{
				route: '',
				callback: 'onRoute_home'
			},
			'test':
			{
				route: 'test',
				callback: 'onRoute_test'
			}
		},

		onRoute_home: function()
		{
			console.log('Router.onRoute_home');
		},

		onRoute_test: function()
		{
			console.log('Router.onRoute_test');
		},

		onInitializationComplete: function()
		{
			console.log('Router.onInitializationComplete');
		}
		
	});

	// There is only one router for the app, so we return it instantiated
	var self = new Router();
	return self;
});
