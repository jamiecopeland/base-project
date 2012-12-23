var fs = require('fs');
var _ = require('underscore');
var Handlebars = require('handlebars');

var unloadedTemplates = [];
var rawTemplates = {};
var compiledTemplates = {};


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
			this.pathPrefix = options.pathPrefix;
			this.pathSuffix = options.pathSuffix;

			if(options.unloadedTemplates)
			{
				this.addTemplates(
					options.unloadedTemplates,
					resultHandler
				);
			}
		},

		compile: function(id, data)
		{
			return this.getCompiledTemplate(id)(data);
		},

		loadFile: function(fileName, resultHandler)
		{
			fs.readFile(
				fileName,
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

		getTemplateByIdAsync: function(id, resultHandler)
		{
			var cachedTemplate = rawTemplates[id];
			if(cachedTemplate)
			{
				resultHandler.success(cachedTemplate);
			}
			else
			{
				this.loadFile(
					this.getPathById(id),
					{
						success: function(data)
						{
							rawTemplates[id] = data;
							resultHandler.success(data);
						},
						error: function(error)
						{
							resultHandler.error(error);
						}
					}
				);
			}
		},
		
		addTemplates: function(templates, resultHandler)
		{
			var self = this;

			_.each(
				templates,
				function(templateReference)
				{
					if(templateReference instanceof Object)
					{
						unloadedTemplates.push(templateReference);
					}
					else
					{
						unloadedTemplates.push(
							{
								id: templateReference,
								path: self.getPathById(templateReference)
							}
						);	
					}
				}
			);

			this.loadNextTemplate(resultHandler);
		},

		loadNextTemplate: function(completionResultHandler)
		{
			var self = this;

			if(unloadedTemplates.length > 0)
			{
				var template = unloadedTemplates[0];
				
				this.loadFile(
					template.path,
					{
						success: function(data)
						{
							// Remove item from unloaded templates
							unloadedTemplates.splice(unloadedTemplates.indexOf(template), 1);
							
							// Add item to the rawTemplatess
							rawTemplates[template.id] = data;

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
			var compiledTemplate = compiledTemplates[id];
			if(!compiledTemplate)
			{
				compiledTemplate = Handlebars.compile(rawTemplates[id]);
				compiledTemplates[id] = compiledTemplate;
			}

			return compiledTemplate;
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
	"includeTemplate",
	function(templateName, data)
	{
		return templaterInstance.compile(templateName, data);
	}
);
