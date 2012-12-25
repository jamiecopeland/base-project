define(
	[
		'jquery',
		'utils/JSONTranslator'
	],
	function(
		$,
		JSONTranslator
	)
	{
		return function()
		{
			// App start point

			function doGoogleTranslate(object, property, resultHandler)
			{
				$.ajax(
					{
						url: 'https://www.googleapis.com/language/translate/v2',
						dataType: 'json',
						data:
						{
							q: object[property],
							key: 'AIzaSyCDGRwMxD9d4idsJVGa91FpApOyxlR5DMQ',
							source: 'en',
							target: 'fr'
						},
						success: function(data)
						{
							object[property] = data.data.translations[0].translatedText;
							resultHandler.success();
						},
						error: function(error)
						{
							resultHandler.error(error);
						}
					}
				);
			}

			function doTestTranslate(object, property, resultHandler)
			{
				object[property] = 'test';
				resultHandler.success();
			}

			// var translator = new JSONTranslator();

			var lang = {
				title: 'This is the title',
				subTitle: 'This is the sub title',
				landingPage: {
					monkey: 'monkeys like bananas',
					cats: 'cats like milk'
				},
				numbers:
				{
					one: 'one',
					two: 'two',
					three: 'three',
					four: 'four',
					five: 'five'
				}
			};

			console.log('before', JSON.stringify(lang));

			JSONTranslator.translateJSON(
				lang,
				doTestTranslate,
				{
					success: function(json)
					{
						console.log('GoogleTranslate.translateJSON success', JSON.stringify(json));
					},
					error: function(error)
					{
						console.log('GoogleTranslate.translateJSON error: ', error);
					}
				}
			);
		};
	}
);