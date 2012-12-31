
var rootPath = __dirname + '/..';

/////////////////////////////////////////////////////////////////
// DEPENDENCIES

// External imports
var express = require('express');
var fs = require('fs');
var translate = require('node-google-translate');
var Handlebars = require('handlebars');
var _ = require('underscore');

// Project imports
var Templater = require(rootPath + '/public/js/libs/templater.js');
var JSONTranslator = require(rootPath + '/public/js/libs/jsonTranslator.js');
var MultiLoader = require(rootPath + '/public/js/libs/multiLoader.js');

/////////////////////////////////////////////////////////////////
// SYSTEM SETTINGS

/////////////////////////////////////////////////////////////////
// CONFIG

var config = {
	port: 3000,
	googleTranslateKey: "YOUR_API_KEY_HERE"
};

function loadUserConfig(completeHandler)
{
	fs.readFile(
		rootPath + '/server/user-config.json',
		'utf8',
		function(err, data)
		{
			if(err)
			{
				completeHandler(false);
			}
			else
			{
				_.extend(config, JSON.parse(data));
				completeHandler(true);
			}
		}
	);
}

/////////////////////////////////////////////////////////////////
// TEMPLATER SETUP

var templater;
var loader = new MultiLoader(
	{
		pathPrefix: __dirname + '/../public/templates',
		pathSuffix: '.hbs',
		loaderType: 'serverLocal',
		// unloadedTemplates: ['index', 'mainMenu']

		unloadedTemplates: [
			{
				id: 'index-traditional',
				path: rootPath + '/public/templates/index-traditional.hbs'
			},
			{
				id: 'index-single-page',
				path: rootPath + '/public/templates/index-single-page.hbs'
			},
			{
				id: 'mainMenu',
				path: rootPath + '/public/templates/mainMenu.hbs'
			}
		]
	},
	{
		success: function()
		{
			templater = new Templater({rawTemplates: loader.rawTemplates});
		},
		error: function()
		{
			console.log('MultiLoader error');
		}
	}
);

/////////////////////////////////////////////////////////////////
// EXPRESS SETUP

var app = express();

//Set the public folder
app.use(express.static(__dirname + '/../public'));

app.use(express.methodOverride());

app.configure(
	function()
	{
		app.use(express.bodyParser());
	}
);

/////////////////////////////////////////////////////////////////
// CORS SETUP

var allowCrossDomain = function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
			
		// intercept OPTIONS method
		if ('OPTIONS' === req.method) {
			res.send(200);
		}
		else {
			next();
		}
};
app.use(allowCrossDomain);


/////////////////////////////////////////////////////////////////
// LANG

var lang = {
	title: 'This is the page title',
	message:'This is dynamic!',
	mainMenu:
	{
		title:'This is the menu title',
		items:
			{
				one: 'one',
				two: 'two',
				three: 'three'
			}
	}
};

function translateJSON(options, resultHandler)
{
	JSONTranslator.translateJSON(
		options.json,
		// doGoogleTranslate,
		// doTestTranslate,

		function(object, property, resultHandler)
		{
			object[property] = '**' + object[property] + '**';
			resultHandler.success();
		},

		// function(object, property, resultHandler)
		// {
		// 	var value = object[property];
		// 	translate(
		// 		{
		// 			q: value,
		// 			source: options.source,
		// 			target: options.target,
		// 			key: config.googleTranslateKey
		// 		},
		// 		function(result)
		// 		{
		// 			object[property] = result[value];
		// 			resultHandler.success();
		// 		}
		// 	);
		// },

		{
			success: function(json)
			{
				// console.log(json);
				lang = json;
				resultHandler.success(json);
			},
			error: function(error)
			{
				console.log('GoogleTranslate.translateJSON error: ', error);
				resultHandler.error();
			}
		}
	);
}

/////////////////////////////////////////////////////////////////
// ROUTES

app.get('/traditional', function(request, response)
{
	var output = templater.compile(
		'index-traditional',
		{
			lang: lang
		}
	);
	response.send(output);
});

app.get('/single-page', function(request, response)
{
	var output = templater.compile(
		'index-single-page',
		{
			lang: lang
		}
	);
	response.send(output);
});

app.post('/translate', function(request, response)
{
	// var output = {'message': 'hello there!!'}

	console.log('request.body.target', request.body.target);

	translateJSON(
		{
			json: request.body.json,
			source: 'en',
			target: 'fr'
		},
		{
			success: function(data)
			{
				console.log('node successfully translated on server: ', data);
				response.send(data);
			},
			error: function()
			{
				next(new Error('The translator went wrong'));
			}
		}
	);
});

app.get(
	'/copy.js',
	function(request, response)
	{
		// Very simple first pass implementation - obviously using caching here in future
		fs.readFile(
			rootPath + '/public/translations/lang_en-gb.js',
			'utf8',
			function(err, data)
			{
				if(err)
				{
					// Do something if we can't load the data
				}
				else
				{
					response.set('Content-Type', 'application/javascript');
					response.send(data);
				}
			}
		);
	}
);

/////////////////////////////////////////////////////////////////
// STARTUP

function onUserConfigLoadComplete()
{
	// onSetupComplete();
	translateJSON(
		{
			json: lang,
			source: 'en',
			target: 'fr'
		},
		{
			success: function()
			{
				onTranslateComplete();
			},
			error: function()
			{
				
			}
		}
	);
}

function onTranslateComplete()
{
	onSetupComplete();
}

function onSetupComplete()
{
	app.listen(config.port);

	console.log('----------------------------------------------------');
	console.log(' SERVER STARTED ON PORT ' + config.port);
	console.log('----------------------------------------------------');
}

function boot()
{
	loadUserConfig(
		function()
		{
			onUserConfigLoadComplete();
		}
	);
}

boot();