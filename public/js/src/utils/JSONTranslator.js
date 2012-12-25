define(
	[
		'underscore',
		'core/BaseClass'
	],

	function(
		_,
		BaseClass
	)
	{
		return BaseClass.extend(
		{

			translateJSON: function(json, translationMethod, resultHandler)
			{
				var self = this;
				var translationList = [];

				// Recursively iterate over object to create a flat list
				function iterateOverChildren(obj)
				{
					_.each(
						obj,
						function(value, key)
						{
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
						},
						this
					);	
				}

				var clone = JSON.parse(JSON.stringify(json));

				iterateOverChildren(clone);

				this.processTranslationList(
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
			},

			processTranslationList: function(translationList, translationMethod, resultHandler)
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
		});
	}
);