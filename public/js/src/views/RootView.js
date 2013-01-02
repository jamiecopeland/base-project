define(
	[
		'underscore',
		'config/Lang',
		'views/BaseView'
	],

	function(
		_,
		Lang,
		BaseView
	)
	{
		return BaseView.extend(
		{

			events:
			{
				//'click .something' : 'onSomething'
			},

			initialize: function(options)
			{
				this.templater = options.templater;

				this.render();
			},

			render: function()
			{
				console.log('RootView Lang', Lang);

				var output = this.templater.compile(
					'root',
					{
						lang: Lang
					}
				);

				this.$el.html(output);
			}
		});
	}
);