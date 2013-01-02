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
		'config/TemplateImporter',
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
		TemplateImporter,
		RootView
	)
	{
		return function()
		{
			////////////////////////////////////////////////////////////
			// VARIABLES

			var locale = parseLocale();
			var templater;

			////////////////////////////////////////////////////////////
			// METHODS

			function parseLocale()
			{
				var rawLocale = $.url(location.href).param('locale');
				var splitLocale = rawLocale ? rawLocale.split('-') : [];

				return {
					language: splitLocale[0] ? splitLocale[0] : 'en',
					country: splitLocale[1] ? splitLocale[1] : 'global'
				};
			}

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
			// STARTUP

			$.when(
				loadLang()
			).done(
				function()
				{
					templater = new Templater({rawTemplates: TemplateImporter});

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