define(
	[
		'jquery',
		'underscore',
		'core/BaseClass'
	],

	function(
		$,
		_,
		BaseClass
	)
	{
		return BaseClass.extend(
		{

			initialize: function(options)
			{
				this.apiDomain = 'https://www.googleapis.com/language/translate/v2';
				this.key = options.key;
				this.defaultSource = options.defaultSource;
				this.defaultTarget = options.defaultTarget;
			},

			translate: function(options, resultHandler)
			{
				return $.ajax(
					{
						url: this.apiDomain,
						dataType: 'json',
						data: this.createAjaxData(options),
						success: resultHandler ? resultHandler.success : null,
						error: resultHandler ? resultHandler.error : null
					}
				);
			},

			translateObjectProperty: function(object, property, options)
			{
				return this.translate(
					{
						q: object[property]
					},
					{
						success: function(data)
						{
							object[property] = data.data.translations[0].translatedText;
						},
						error: function()
						{
							//TODO Deal with this
						}
					}
				);
			},

			translateJSON: function(json, resultHandler)
			{
				var self = this;
				var deferreds = [];

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
								deferreds.push(self.translateObjectProperty(obj, key));
							}
						},
						this
					);	
				}

				iterateOverChildren(json);

				return $.when.apply(null, deferreds).then(
					function(data, result)
					{
						if(result === 'success')
						{
							console.log('translateJSON error', error);
							resultHandler.error(data);
						}
						else
						{
							console.log('translateJSON complete', JSON.stringify(json));
							resultHandler.success(json);
						}
					}
				);
			},

			createAjaxData: function(options)
			{
				return {
					q: options.q,
					key: options.key ? options.key : this.key,
					source: options.source ? options.source : this.defaultSource,
					target: options.target ? options.target : this.defaultTarget
				};
			}
		});
	}
);