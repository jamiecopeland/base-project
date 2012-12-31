
var rootPath = __dirname + '/..';

var fs = require('fs');
var _ = require('underscore');
var Handlebars = require('handlebars');
var MultiLoader = require(rootPath + '/public/js/libs/MultiLoader.js');


var environment;

if(typeof window === 'undefined')
{
	environment = 'node';
}
else
{
	environment = 'node';
}

///////////////////////////////////////////////////////////////
// BASE CLASS

var BaseClass = function(){};

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
			this.rawTemplates = options.rawTemplates ? options.rawTemplates : {};
			this.compiledTemplates = options.compiledTemplates ? options.compiledTemplates : {};
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

//////////////////////////////////////////////////////////////
// HANDLEBARS HELPERS

Handlebars.registerHelper(
	"template",
	function(templateName, data)
	{
		return templaterInstance.compile(templateName, data);
	}
);

/////////////////////////////////////////////////////////////
// PUBLIC NODE METHODS

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

exports.MultiLoader = MultiLoader;
exports.Templater = Templater;
