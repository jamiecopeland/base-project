define(
	[
		'lang',
		'jquery',
		'underscore',
		'backbone',
		'jsonTranslator',
		'multiloader',
		'templater',
		'utils/EventBus',
		'config/Router',
		'config/Config',
		'views/RootView'
	],
	function(
		lang,
		$,
		_,
		Backbone,
		JSONTranslator,
		MultiLoader,
		Templater,
		EventBus,
		Router,
		Config,
		RootView
	)
	{
		return function()
		{
			// App start point
			var templater;
			var language = 'fr';

			////////////////////////////////////////////////////////////

			function loadLang(resultHandler)
			{
				return $.ajax(
					{
						url: '/translations/lang_'+language+'.json',
						type: 'GET',
						dataType: 'json',
						success: function(data)
						{
							_.extend(lang, data);
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
					onInitialLoadComplete();
				}
			);

			function onInitialLoadComplete()
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
		};


	}
);