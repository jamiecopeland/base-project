
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
var templater = require(rootPath + '/server/templater.js');
var JSONTranslator = require(rootPath + '/public/js/libs/jsonTranslator.js');


/////////////////////////////////////////////////////////////////
// SYSTEM SETTINGS

/////////////////////////////////////////////////////////////////
// CONFIG

var config = {
	port: 3000
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

var startTime = new Date();

templater.initialize(
	{
		pathPrefix: __dirname + '/../public/templates',
		pathSuffix: '.hbs',
		loaderType: 'serverLocal',
		unloadedTemplates: ['index', 'mainMenu']
		// unloadedTemplates: [
		// 	{
		// 		id: 'index',
		// 		path: rootPath + '/public/templates/index.hbs'
		// 	},
		// 	{
		// 		id: 'mainMenu',
		// 		path: rootPath + '/public/templates/mainMenu.hbs'
		// 	}
		// ]
	},
	{
		success: function()
		{
			var endTime = new Date();
			console.log('Templater initialization time: ', endTime.getTime() - startTime.getTime());
		},
		error: function(error)
		{
			console.log('Templater initialization error: ' + error.message);
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
				two: 'two'
			}
	}
};


function doTestTranslate(object, property, resultHandler)
{
	object[property] = 'test';
	resultHandler.success();
}

function doGoogleTranslate(object, property, resultHandler)
{
	var value = object[property];
	translate(
		{
			q: value,
			target: 'eo',
			key: config.googleTranslateKey
		},
		function(result)
		{
			object[property] = result[value];
			resultHandler.success();
		}
	);
}

function translateLang(resultHandler)
{
	JSONTranslator.translateJSON(
		lang,
		doGoogleTranslate,
		// doTestTranslate,
		{
			success: function(json)
			{
				// console.log(json);
				lang = json;
				resultHandler.success();
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

app.get('/', function(request, response)
{
	var output = templater.compile(
		'index',
		{
			lang: lang
		}
	);
	response.send(output);
});

/////////////////////////////////////////////////////////////////
// STARTUP

function onUserConfigLoadComplete()
{
	translateLang(
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