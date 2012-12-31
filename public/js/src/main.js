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
		RootView
	)
	{
		return function()
		{
			
			
			// App start point

			function doNodeTranslation(json, resultHandler)
			{
				$.ajax(
					{
						url: '/translate',
						type: 'POST',
						dataType: 'json',
						data:
						{
							json: json,
							source: 'en',
							target: 'ja'
						},
						success: function(data)
						{
							resultHandler.success(data);
						},
						error: function(error)
						{
							resultHandler.error(error);
						}
					}
				);
			}

			// doNodeTranslation(
			// 	lang,
			// 	{
			// 		success: function(data)
			// 		{
						
			// 			lang = data;

			// 			_.extend(lang, data);
			// 		},
			// 		error: function(error)
			// 		{
			// 			console.log('doNodeTranslation error');
			// 		}
			// 	}
			// );

			loadTemplates();

			////////////////////////////////////////////////////////////

			var templater;
			var loader;

			function loadTemplates()
			{
				loader = new MultiLoader(
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
						templater = new Templater({rawTemplates: loader.rawTemplates});
						startup();
					},
					error: function()
					{
						console.log('MultiLoader error');
					}
				}
			);
			}

			////////////////////////////////////////////////////////////

			function startup()
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