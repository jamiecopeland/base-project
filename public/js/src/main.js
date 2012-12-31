define(
	[
		'jquery',
		'backbone',
		'jsonTranslator',
		'utils/EventBus',
		'config/Router'
	],
	function(
		$,
		Backbone,
		JSONTranslator,
		EventBus,
		Router
	)
	{
		return function()
		{

			var lang = {
				title: 'This is the page title',
				message:'This is dynamic!',
				mainMenu:
				{
					title:'This is the menu title',
					items:
						{
							one: 'one',
							two: 'two',
							three: 'three'
						}
				}
			};

			console.log('before', JSON.stringify(lang));
			
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
			// 			console.log('doNodeTranslation success: ', data);
			// 		},
			// 		error: function(error)
			// 		{
			// 			console.log('doNodeTranslation error');
			// 		}
			// 	}
			// );

			Router.start();
			EventBus.trigger('startup.initializationComplete');
		};
	}
);