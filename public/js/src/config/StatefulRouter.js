define([
	'underscore',
	'backbone'
], function(
	_,
	Backbone
) {
	// Modifies the Backbone Router to add stateful functionality
	// Routes can now be described with state names, and the last navigated state can be accessed
	// using the Router.currentRoute property. Additionally, a general 'route' event is triggered
	// every time a route fires. You can also perform a reverse lookup on routes to get a url using
	// the Router.getUrl() method.
	return Backbone.Router.extend({

		// We need to copy the original route method in Backbone so we can insert code in
		// some strategic places. The new code is found between >>> <<< comments.
		route: function(route, name, callback) {
			// >>> Extract the parameter keys from the route
			var paramKeys = this._extractParamKeys(route);
			// <<<

			if (!Backbone.history) { Backbone.history = new Backbone.History(); }
			if (!_.isRegExp(route)) { route = this._routeToRegExp(route); }
			if (!callback) { callback = this[name]; }
			Backbone.history.route(route, _.bind(function(fragment) {
				var args = this._extractParameters(route, fragment);

				// >>> Merge param keys and the values sent in the url
				var params = _.object(paramKeys, args);
				this.currentRoute = {name: name, params: params};
				// <<<

				// By default the router will trigger events, but this can be stopped by returning
				// false from the route's callback
				var triggerEvents = true;
				if (callback) {
					triggerEvents = callback.apply(this, args);
				}

				if (triggerEvents !== false) {
					this.trigger.apply(this, ['route:' + name].concat(args));
					Backbone.history.trigger('route', this, name, args);

					// >>> Trigger general route event from here
					this.trigger.call(this, 'route', name, params);
					// <<<
				}
			}, this));
			return this;
		},

		// Override the function that creates routes from the supplied .routes property
		// Routes can now be described with separate names and callback functions, like so:
		// routes: {
		//   'search': {
		//     route: 'search/:query',
		//     callback: 'onSearch'
		//   }
		// }
		_bindRoutes: function() {
			if (!this.routes) {
				return;
			}
			var routes = [];
			for (var route in this.routes) {
				routes.unshift([route, this.routes[route]]);
			}
			for (var i = 0, l = routes.length; i < l; i++) {
				this.route(routes[i][1].route, routes[i][0], this[routes[i][1].callback]);
			}
		},

		// Extract the keys for each parameter in the route and return them as an array
		// For example, if the route is: 'search/:query/p:page'
		// then the returned array will be: ['query', 'page']
		_extractParamKeys: function(route) {
			// Extract the parameters and splats from the route
			// If neither could be found then just use empty arrays
			var params = route.match(/:\w+/g) || [];
			var splats = route.match(/\*\w+/g) || [];
			params = params.concat(splats);

			// Strip the : and * characters from each route param
			_(params).each(function(item, index) {
				params[index] = item.substr(1);
			});
			return params;
		},

		// Shortcut to combine the getUrl and navigate methods
		//   Router.navigateToUrl('search', {
		//     query: 'wolf',
		//     page: 7
		//   }, {trigger: true});
		navigateToRoute: function(route, params, options) {
			// Set trigger to true by default. Will be overriden by the incoming options if it's set.
			options = _.extend({trigger: true}, options);
			this.navigate(this.getUrl(route, params), options);
		},

		// Returns a route url with the parameters replaced by the properties in the params object
		// For example, if the route is:
		//   'search': {
		//     route: 'search/:query/p:page',
		//     callback: 'onSearch'
		//   }
		// you can call: Router.getUrl('search', {query: 'wolf', page: '7'})
		// which returns: 'search/wolf/p7'
		getUrl: function(route, params) {
			var routeUrl = this.routes[route].route;
			_(params).each(function(param, key) {
				// Replace each params in the route string with the value from the passed params
				// We need to check both :params and *splats, so as a cludge we'll do a replace for both
				routeUrl = routeUrl.replace(':' + key, params[key]);
				routeUrl = routeUrl.replace('*' + key, params[key]);
			});
			return routeUrl;
		}
	});
});
