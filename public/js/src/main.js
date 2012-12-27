define(
	[
		'jquery',
		'jsonTranslator'
	],
	function(
		$,
		JSONTranslator
	)
	{
		return function()
		{

			var lang = {
				penny: 'Penelope',
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

			doNodeTranslation(
				lang,
				{
					success: function(data)
					{
						console.log('doNodeTranslation success: ', data);
					},
					error: function(error)
					{
						console.log('doNodeTranslation error');
					}
				}
			);
		};
	}
);