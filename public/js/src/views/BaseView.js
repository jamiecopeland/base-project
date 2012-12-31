define(
[
	'jquery',
	'underscore',
	'backbone'
],
function(
	$,
	_,
	Backbone
)
{
	return Backbone.View.extend(
	{
		//////////////////////////////////////////////////////////////////////////////////////
		// Touch / click 

		// touchEventMap:
		// {
		// 	'tap': 'touchend'
		// },

		// clickEventMap:
		// {
		// 	'tap': 'click'
		// },

		// delegateEvents: function(events)
		// {
		// 	this.preProcessEvents();
		// 	Backbone.View.prototype.delegateEvents.apply(this, arguments);
		// },§

		// undelegateEvents: function()
		// {
		// 	Backbone.View.prototype.undelegateEvents.apply(this, arguments);
		// },

		// preProcessEvents: function()
		// {
		// 	this.eventMap = Modernizr.touch ? this.touchEventMap : this.clickEventMap;

		// 	_.each(
		// 		this.events,
		// 		function(item, key)
		// 		{
		// 			var indexOfSpace = key.indexOf(' ');
		// 			var eventName = key.slice(0, indexOfSpace);
		// 			var replacement = this.eventMap[eventName];
		// 			if (replacement) {
		// 				this.events[replacement + key.slice(indexOfSpace, key.length)] = item;
		// 				delete this.events[key];
		// 			}
		// 		},
		// 		this);
		// },

		//////////////////////////////////////////////////////////////////////////////////////
		// Transitions

		transitionInDuration: 300,
		transitionOutDuration: 300,

		show: function(doImmediately)
		{
			return doImmediately ? this._showImmediately() : this._showTransition();
		},

		_showTransition: function()
		{
			this.state = 'showing';

			var self = this;
			return $.when(
				this.$el
				.stop()
				.css(
					{
						'display': 'block'
					}
				)
				.animate(
					{
						opacity: 1
					},
					{
						duration: this.transitionInDuration
					}
				)
				.queue(
					function()
					{
						self.state = 'shown';
						self.$el.dequeue();
					}
				)
			);
		},

		_showImmediately: function()
		{
			this.state = 'shown';
			var self = this;

			return $.when(
				this.$el
				.queue(
					function()
					{
						self.$el.css(
							{
								opacity: 1,
								display: 'block'
							}
						);

						self.state = 'shown';
						self.$el.dequeue();
					}
				)
			);
		},

		hide: function(doImmediately)
		{
			return doImmediately ? this._hideImmediately() : this._hideTransition();
		},

		_hideTransition: function()
		{
			this.state = 'hiding';

			var self = this;
			return $.when(
				
				this.$el
					.stop()
					.animate(
						{
							opacity: 0
						},
						{
							duration: this.transitionOutDuration
						}
					)
					.queue(
						function()
						{
							self.$el.css(
								{
									'display': 'none'
								}
							);
							self.state = 'hidden';
							self.$el.dequeue();
						}
					)
			);
		},

		_hideImmediately: function()
		{
			var self = this;

			return $.when(
				this.$el
				.queue(
					function()
					{
						self.$el.css(
							{
								opacity: 0,
								display: 'none'
							}
						);

						self.state = 'hidden';
						self.$el.dequeue();
					}
				)
			);
		}

	});
});
