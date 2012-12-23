var fs = require('fs');
var _ = require('underscore');
var Handlebars = require('handlebars');

var rootPath = __dirname + '/..';
var pathPrefix = '';
var pathSuffix = '';
var templatesFolderPath = rootPath + '/public/templates';

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
			pathPrefix = options.pathPrefix;
			pathSuffix = options.pathSuffix;

			addTemplates(
				options.unloadedTemplates,
				resultHandler
			);
		},

		compile: function(id, data)
		{
			var output = compile(id, data);
			return compile(id, data);
		}
	}
);

///////////////////////////////////////////////////////////////

function loadFile(fileName, resultHandler)
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
}

function getTemplateByIdAsync(id, resultHandler)
{
	var cachedTemplate = rawTemplates[id];
	if(cachedTemplate)
	{
		resultHandler.success(cachedTemplate);
	}
	else
	{
		loadFile(
			getPathById(id),
			// templatesFolderPath + '/' + id + '.hbs',
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
}

function addTemplate(id, resultHandler)
{
	loadFile(
		templatesFolderPath + '/' + id + '.hbs',
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

function addTemplates(templates, resultHandler)
{
	if(templates instanceof Array)
	{
		_.each(
			templates,
			function(template)
			{
				unloadedTemplates.push(
					{
						id: template,
						path: getPathById(template)
					}
				);
				// console.log(' adding template', template);
			}
		);

		loadNextTemplate(resultHandler);
	}
	else
	{

	}
}

function loadNextTemplate(completionResultHandler)
{
	if(unloadedTemplates.length > 0)
	{
		var template = unloadedTemplates[0];
		
		loadFile(
			template.path,
			{
				success: function(data)
				{
					// Remove item from unloaded templates
					unloadedTemplates.splice(unloadedTemplates.indexOf(template), 1);
					
					// Add item to the rawTemplatess
					rawTemplates[template.id] = data;

					loadNextTemplate(completionResultHandler);
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
}

function getCompiledTemplate(id)
{
	var compiledTemplate = compiledTemplates[id];
	if(!compiledTemplate)
	{
		compiledTemplate = Handlebars.compile(rawTemplates[id]);
		compiledTemplates[id] = compiledTemplate;
	}

	return compiledTemplate;
}

function getPathById(id)
{
	return pathPrefix + '/' + id + pathSuffix;
}

function compile(id, data)
{
	return getCompiledTemplate(id)(data);
}

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
		return compile(templateName, data);
	}
);
