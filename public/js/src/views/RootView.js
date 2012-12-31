define(
	[
		'underscore',
		'lang',
		'views/BaseView'
	],

	function(
		_,
		lang,
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
				var output = this.templater.compile(
					'root',
					{
						lang: lang
					}
				);

				this.$el.html(output);
			}
		});
	}
);