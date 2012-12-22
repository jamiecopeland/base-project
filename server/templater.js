var fs = require('fs');
var handlebars = require('handlebars');

var rootPath = __dirname + '/..';
var templatesFolderPath = rootPath + '/public/templates';

var rawTemplates = {};
var compiledTemplates = {};

function loadtemplate(fileName, resultHandler)
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
		loadtemplate(
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
}

function getRawTemplate(id)
{
	return rawTemplates[id];
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

exports.initialize = function(completeHandler)
{
	getTemplateById(
		'index',
		{
			success: function(data)
			{
				console.log('TEMPLATES LOADED');
			},
			error: function(error)
			{
				console.log('getTemplateById error', error);
			}
		}
	);
};

exports.compile = function(id, data)
{
	return getCompiledTemplate(id)(data);
};

