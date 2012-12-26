
(function(){

	var root = this;

	// Save the previous value of JSONTranslator
	var previousJSONTranslator = root.JSONTranslator;

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

	var JSONTranslator = function(){};

	JSONTranslator.translateJSON = function(json, translationMethod, resultHandler)
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

	root.JSONTranslator = JSONTranslator;

}).call(this);