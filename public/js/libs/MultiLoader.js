(function(){
	
	var _;
	var fs;
	var $;

	///////////////////////////////////////////////////////////
	// SETUP ENVIRONMENT AND EXPORTS

	var root = this;
	var environment;
	var MultiLoader =  function()
	{
		this.initialize.apply(this, arguments);
	};

	if(typeof root.window === 'undefined')
	{
		environment = 'node';

		_ = require('underscore');
		fs = require('fs');

		module.exports = exports = MultiLoader;
	}
	else
	{
		environment = 'browser';

		if (!_ && (typeof require !== 'undefined'))
		{
			_ = require('underscore');
		}

		if (!$ && (typeof require !== 'undefined'))
		{
			$ = require('jquery');
		}

		root.MultiLoader = MultiLoader;
	}

	///////////////////////////////////////////////////////////
	// MULTILOADER

	_.extend(
		MultiLoader.prototype,
		{
			initialize: function(options, resultHandler)
			{
				this.unloadedTemplates = [];
				this.rawTemplates = {};

				if(options)
				{
					if(options.loaderType)
					{
						this.loaderType = options.loaderType;
					}
					else
					{
						this.loaderType = this.deriveLoaderType();
					}

					this.pathPrefix = options.pathPrefix;
					this.pathSuffix = options.pathSuffix;

					if(options.unloadedTemplates)
					{
						this.loadTemplates(
							options.unloadedTemplates,
							resultHandler
						);
					}
				}
				else
				{
					this.loaderType = this.deriveLoaderType();
				}
			},

			deriveLoaderType: function()
			{
				if(typeof window === 'undefined')
				{
					return 'serverLocal';
				}
				else
				{
					return 'browserRemote';
				}
			},

			loadFile: function(path, resultHandler)
			{
				// TODO Refactor
				switch(this.loaderType)
				{
					case 'serverLocal':
						this.loadServerLocal(path, resultHandler);
					break;

					case 'browserRemote':
						this.loadBrowserRemote(path,resultHandler);
					break;
				}
			},

			loadServerLocal: function(filePath, resultHandler)
			{
				fs.readFile(
					filePath,
					'utf8',
					function(err, data)
					{
						if(err)
						{
							resultHandler.error(err);
						}
						else
						{
							resultHandler.success(data);
						}
					}
				);
			},

			loadBrowserRemote: function(fileName, resultHandler)
			{
				$.ajax(
					{
						url: fileName,
						success: resultHandler.success,
						error: resultHandler.error
					}
				);
			},
			
			loadTemplates: function(templates, resultHandler)
			{
				_.each(
					templates,
					function(templateReference)
					{
						if(templateReference instanceof Object)
						{
							this.unloadedTemplates.push(templateReference);
						}
						else
						{
							this.unloadedTemplates.push(
								{
									id: templateReference,
									path: this.getPathById(templateReference)
								}
							);
						}
					},
					this
				);

				this.loadNextTemplate(resultHandler);
			},

			loadNextTemplate: function(completionResultHandler)
			{
				var self = this;

				if(this.unloadedTemplates.length > 0)
				{
					var template = this.unloadedTemplates[0];
					
					this.loadFile(
						template.path,
						{
							success: function(data)
							{
								// Remove item from unloaded templates
								self.unloadedTemplates.splice(self.unloadedTemplates.indexOf(template), 1);
								
								// Add item to the rawTemplatess
								self.rawTemplates[template.id] = data;

								self.loadNextTemplate(completionResultHandler);
							},
							error: function(error)
							{
								completionResultHandler.error(new Error('Error Loading Template: ' + template.id + ' - ' + template.path));
							}
						}
					);
				}
				else
				{
					completionResultHandler.success();
				}
			},

			getPathById: function(id)
			{
				return this.pathPrefix + '/' + id + this.pathSuffix;
			}
		}
	);
}).call(this);