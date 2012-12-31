(function(){
	var rootPath = __dirname + '/..';

	console.log('rootPath', global.ROOT_PATH);

	var fs = require('fs');
	var _ = require('underscore');
	var Handlebars = require('handlebars');
	var MultiLoader = require(global.ROOT_PATH + '/public/js/libs/MultiLoader.js');

	///////////////////////////////////////////////////////////
	// SETUP ENVIRONMENT AND EXPORTS

	var root = this;
	var environment;
	var Templater =  function()
	{
		this.initialize.apply(this, arguments);
	};

	if(typeof root.window === 'undefined')
	{
		environment = 'node';
		module.exports = exports = Templater;
	}
	else
	{
		environment = 'browser';
		root.Templater = Templater;
	}

	///////////////////////////////////////////////////////////////
	// TEMPLATER

	_.extend(
		Templater.prototype,
		{
			initialize: function(options, resultHandler)
			{
				this.rawTemplates = options.rawTemplates ? options.rawTemplates : {};
				this.compiledTemplates = options.compiledTemplates ? options.compiledTemplates : {};

				this.createHandlebarsHelper();
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

			createHandlebarsHelper: function()
			{
				var self = this;

				Handlebars.registerHelper(
					"template",
					function(templateName, data)
					{
						return self.compile(templateName, data);
					}
				);
			}
		}
	);
}).call(this);