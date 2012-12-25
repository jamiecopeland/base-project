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

			this.unloadedTemplates = [];
			this.rawTemplates = {};
			this.compiledTemplates = {};



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

		compile: function(id, data)
		{
			return this.getCompiledTemplate(id)(data);
		},

		loadFile: function(path, resultHandler)
		{
			// TODO Refact
			switch(this.loaderType)
			{
				case 'serverLocal':
					this.loadServerLocal(path, resultHandler);
				break;

				case 'browserRemote':
					$.ajax(
						{
							url: path,
							success: resultHandler.success,
							error: resultHandler.error
						}
					);
				break;
			}
		},

		/////////////////////////////////////////////////////
		// LOADER TYPES

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

		loadBrowserRemote: function()
		{
			$.ajax(
				{
					url: fileName,
					success: resultHandler.success,
					error: resultHandler.error
				}
			);
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

exports.initialize = function(options, resultHandler)
{
	templaterInstance = new Templater(options, resultHandler);
};

exports.compile = function(id, data)
{
	return templaterInstance.compile(id, data);
};

//////////////////////////////////////////////////////////////
// HANDLEBARS HELPERS

Handlebars.registerHelper(
	"template",
	function(templateName, data)
	{
		return templaterInstance.compile(templateName, data);
	}
);
