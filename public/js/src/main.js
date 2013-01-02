define(
	[
		'jquery',
		'underscore',
		'backbone',
		'jsonTranslator',
		'multiloader',
		'templater',
		'utils/EventBus',
		'config/Router',
		'config/Config',
		'config/Lang',
		'views/RootView'
	],
	function(
		$,
		_,
		Backbone,
		JSONTranslator,
		MultiLoader,
		Templater,
		EventBus,
		Router,
		Config,
		Lang,
		RootView
	)
	{
		return function()
		{
			// App start point
			var locale = parseLocale();
			var templater;

			function parseLocale()
			{
				var rawLocale = $.url(location.href).param('locale');
				var splitLocale = rawLocale ? rawLocale.split('-') : [];

				return {
					language: splitLocale[0] ? splitLocale[0] : 'en',
					country: splitLocale[1] ? splitLocale[1] : 'global'
				};
			}

			////////////////////////////////////////////////////////////

			function loadLang(resultHandler)
			{
				return $.ajax(
					{
						url: '/translations/lang_' + locale.language + '.json',
						type: 'GET',
						dataType: 'json',
						success: function(data)
						{
							_.extend(Lang, data);
						}
					}
				);
			}

			////////////////////////////////////////////////////////////

			function loadTemplates()
			{
				var deferred = $.Deferred();

				var multiLoader = new MultiLoader(
					{
						// pathPrefix: '../templates',
						// pathSuffix: '.hbs',
						// unloadedTemplates: ['index', 'mainMenu']

						unloadedTemplates: [
							{
								id: 'root',
								path: '../templates/root.hbs'
							},
							{
								id: 'mainMenu',
								path: '../templates/mainMenu.hbs'
							}
						]
					},
					{
						success: function()
						{
							templater = new Templater({rawTemplates: multiLoader.rawTemplates});
							deferred.resolve();
						},
						error: function()
						{
							console.log('MultiLoader error');
						}
					}
				);

				return deferred;
			}

			////////////////////////////////////////////////////////////

			$.when(
				loadLang(),
				loadTemplates()
			).done(
				function()
				{
					this.rootView = new RootView(
						{
							el: $('#root'),
							templater: templater
						}
					);

					Router.start(this.rootView);
					EventBus.trigger('startup.initializationComplete');
				}
			);
		};


	}
);