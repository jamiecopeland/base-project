define(
	[
		'jquery',
		'utils/GoogleTranslate'
	],
	function(
		$,
		GoogleTranslate
	)
	{
		return function()
		{
			// App start point

			var translator = new GoogleTranslate(
				{
					apiDomain: 'https://www.googleapis.com/language/translate/v2',
					key: 'AIzaSyCDGRwMxD9d4idsJVGa91FpApOyxlR5DMQ',
					defaultSource: 'en',
					defaultTarget: 'ja'
				}
			);

			var lang = {
				title: 'This is the title',
				subTitle: 'This is the sub title',
				landingPage: {
					monkey: 'monkeys like bananas',
					cats: 'cats like milk'
				}
			};

			translator.translateJSON(
				lang,
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