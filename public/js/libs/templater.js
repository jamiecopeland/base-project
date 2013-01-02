(function(){

	var fs;
	var _;
	var Handlebars;

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

		fs = require('fs');
		_ = require('underscore');
		Handlebars = require('handlebars');

		module.exports = exports = Templater;
	}
	else
	{
		environment = 'browser';

		if (!_ && (typeof require !== 'undefined'))
		{
			_ = require('underscore');
		}

		if (!Handlebars && (typeof require !== 'undefined'))
		{
			Handlebars = require('handlebars');
		}

		root.Templater = Templater;
	}

	///////////////////////////////////////////////////////////////
	// TEMPLATER

	var _instance;

	_.extend(
		Templater,
		{
			getInstance: function()
			{
				return _instance;
			}
		}
	);

	_.extend(
		Templater.prototype,
		{
			initialize: function(options, resultHandler)
			{
				this.rawTemplates = options.rawTemplates ? options.rawTemplates : {};
				this.compiledTemplates = options.compiledTemplates ? options.compiledTemplates : {};

				this.createHandlebarsHelper();

				_instance = this;
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