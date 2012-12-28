

// // Simple translation - to fixed value
// function doTestTranslate(object, property, resultHandler)
// {
// 	object[property] = 'test';
// 	resultHandler.success();
// }

// // Server side translation using node-google-translate package
// function doGoogleTranslateServerSide(object, property, resultHandler)
// {
// 	var value = object[property];
// 	translate(
// 		{
// 			q: value,
// 			target: 'el',
// 			key: <INSERT_YOUR_API_KEY>
// 		},
// 		function(result)
// 		{
// 			object[property] = result[value];
// 			resultHandler.success();
// 		}
// 	);
// }

// // Client side translation using jquery.ajax
// function doGoogleTranslateClientSide(object, property, resultHandler)
// {
// 	$.ajax(
// 		{
// 			url: 'https://www.googleapis.com/language/translate/v2',
// 			dataType: 'json',
// 			data:
// 			{
// 				q: object[property],
// 				key: <INSERT_YOUR_API_KEY>,
// 				source: 'en',
// 				target: 'ja'
// 			},
// 			success: function(data)
// 			{
// 				object[property] = data.data.translations[0].translatedText;
// 				resultHandler.success();
// 			},
// 			error: function(error)
// 			{
// 				resultHandler.error(error);
// 			}
// 		}
// 	);
// }
// 
// // Example implementation
// function translateJSON(json, resultHandler)
// {
// 	JSONTranslator.translateJSON(
// 		json,
// 		doTestTranslate,
// 		{
// 			success: function(json)
// 			{
// 				console.log('JSONTranslator success: ', json);
// 			},
// 			error: function(error)
// 			{
// 				console.log('JSONTranslator error: ', error);
// 			}
// 		}
// 	);
// }


(function(){

	/////////////////////////////////////////////////////////////////////////////
	// SETUP AND ENVIRONMENT
	var root = this;

	// Save the previous value of JSONTranslator
	var previousJSONTranslator = root.JSONTranslator;

	var exporter = function(){};

	// If we're running in node.js
	if (typeof exports !== 'undefined')
	{
		if (typeof module !== 'undefined' && module.exports)
		{
			exports = module.exports = exporter;
		}
		exports.JSONTranslator = exporter;
	}
	else
	{
		root.JSONTranslator = exporter;
	}

	exporter.noConflict = function()
	{
		root.JSONTranslator = previousJSONTranslator;
		return this;
	};

	/////////////////////////////////////////////////////////////////////////////
	// UNEXPORTED METHODS

	function processTranslationList(translationList, translationMethod, resultHandler)
	{
		var currentIndex = 0;

		function onItemComplete()
		{
			currentIndex++;
			processNextTranslation();
		}

		function processNextTranslation()
		{
			var item = translationList[currentIndex];

			if(item === undefined)
			{
				resultHandler.success();
			}
			else
			{
				translationMethod(
					item.object,
					item.property,
					{
						success: function()
						{
							onItemComplete();
						},
						error: function()
						{
							resultHandler.error();
						}
					}
				);
			}
		}

		processNextTranslation();
	}

	/////////////////////////////////////////////////////////////////////////////
	// EXPORTED METHODS

	exporter.translateJSON = function(json, translationMethod, resultHandler)
	{
		var self = this;
		var translationList = [];

		// Recursively iterate over object to create a flat list
		function iterateOverChildren(obj)
		{
			for(var key in obj)
			{
				var value = obj[key];

				if(value instanceof Object)
				{
					iterateOverChildren(value);
				}
				else
				{
					translationList.push({
						object: obj,
						property: key
					});
				}
			}
		}

		var clone = JSON.parse(JSON.stringify(json));

		iterateOverChildren(clone);

		processTranslationList(
			translationList,
			translationMethod,
			{
				success: function()
				{
					resultHandler.success(clone);
				},
				error: function(error)
				{
					resultHandler.error(error);
				}
			}
		);
	};


	

	root.JSONTranslator = exporter;

}).call(this);