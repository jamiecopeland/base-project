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

			initialize: function(options)
			{
				this.translationMethod = options.translationMethod;
			},

			translateJSON: function(json, resultHandler)
			{
				var self = this;
				var deferreds = [];

				var translationList = [];

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

				iterateOverChildren(json);

				this.processTranslationList(translationList, this.translationMethod, resultHandler);
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