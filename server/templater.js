var fs = require('fs');
var _ = require('underscore');
var Handlebars = require('handlebars');

///////////////////////////////////////////////////////////////
// BASE CLASS

var BaseClass = function(){
	
};

BaseClass.extend = function(newPrototype)
{
	var output = function()
	{
		this.initialize.apply(this, arguments);
	};
	_.extend(output.prototype, this.prototype, newPrototype);
	return output;
};

///////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////
// TEMPLATER

var Templater = BaseClass.extend(
	{
		initialize: function(options, resultHandler)
		{
			this.rawTemplates = {};
			this.compiledTemplates = {};

			this.rawTemplates = options.rawTemplates;
		},

		compile: function(id, data)
		{
			return this.getCompiledTemplate(id)(data);
		},

		addTemplates: function(templates)
		{
			_.each(
				templates,
				function(template)
				{
					this.rawTemplates[template.id] = template.value;
				},
				this
			);
		},

		//////////////////////////////////////////////////////////////////////

		getCompiledTemplate: function(id)
		{
			var compiledTemplate = this.compiledTemplates[id];
			if(!compiledTemplate)
			{
				compiledTemplate = Handlebars.compile(this.getRawTemplate(id));
				this.compiledTemplates[id] = compiledTemplate;
			}

			return compiledTemplate;
		},

		getRawTemplate: function(id)
		{
			return this.rawTemplates[id];
		}
	}
);

///////////////////////////////////////////////////////////////
// TEMPLATER

var MultiLoader = BaseClass.extend(
	{
		initialize: function(options, resultHandler)
		{
			if(options.loaderType)
			{
				this.loaderType = options.loaderType;
			}
			else
			{
				if(typeof window === 'undefined')
				{
					this.loaderType = 'serverLocal';
				}
				else
				{
					this.loaderType = 'browserRemote';
				}
			}

			this.unloadedTemplates = [];
			this.rawTemplates = {};

			this.pathPrefix = options.pathPrefix;
			this.pathSuffix = options.pathSuffix;
			this.loaderType = options.loaderType;

			if(options.unloadedTemplates)
			{
				this.loadTemplates(
					options.unloadedTemplates,
					resultHandler
				);
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

///////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////
// PUBLIC METHODS

var templaterInstance;
var multiLoader;

exports.initialize = function(options, resultHandler)
{
	// templaterInstance = new Templater(options, resultHandler);

	multiLoader = new MultiLoader(
		options,
		{
			success: function()
			{
				templaterInstance = new Templater({rawTemplates: multiLoader.rawTemplates});

				resultHandler.success();
			},
			error: function()
			{
				resultHandler.error();
			}
		});
};

exports.compile = function(id, data)
{
	return templaterInstance.compile(id, data);
};

// exports.MultiLoader = MultiLoader;
// exports.Templater = Templater;

//////////////////////////////////////////////////////////////
// HANDLEBARS HELPERS

Handlebars.registerHelper(
	"template",
	function(templateName, data)
	{
		return templaterInstance.compile(templateName, data);
	}
);
