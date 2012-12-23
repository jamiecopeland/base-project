var fs = require('fs');
var _ = require('underscore');
var handlebars = require('handlebars');

var rootPath = __dirname + '/..';
var pathPrefix = '';
var pathSuffix = '';
var templatesFolderPath = rootPath + '/public/templates';

var unloadedTemplates = [];
var rawTemplates = {};
var compiledTemplates = {};



function loadTemplate(fileName, resultHandler)
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

function getTemplateById(id, resultHandler)
{
	var cachedTemplate = rawTemplates[id];
	if(cachedTemplate)
	{
		resultHandler.success(cachedTemplate);
	}
	else
	{
		console.log(getPathById(id));
		loadTemplate(
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
	loadTemplate(
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
				console.log('add templates', template);
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
		
		loadTemplate(
			template.path,
			{
				success: function()
				{
					// Remove item from unloaded templates
					unloadedTemplates.splice(unloadedTemplates.indexOf(template), 1);
					
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
		compiledTemplate = handlebars.compile(rawTemplates[id]);
		compiledTemplates[id] = compiledTemplate;
	}

	return compiledTemplate;
}

function getPathById(id)
{
	return pathPrefix + '/' + id + pathSuffix;
}

exports.initialize = function(options, resultHandler)
{
	pathPrefix = options.pathPrefix;
	pathSuffix = options.pathSuffix;

	addTemplates(
		options.templates,
		resultHandler
	);
};

exports.compile = function(id, data)
{
	return getCompiledTemplate(id)(data);
};

