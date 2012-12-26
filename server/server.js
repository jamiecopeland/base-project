
var rootPath = __dirname + '/..';
var port = 3000;

var express = require('express');
var fs = require('fs');
var translate = require('node-google-translate');
var Handlebars = require('handlebars');
var _ = require('underscore');

var templater = require(rootPath + '/server/templater.js');
var JSONTranslator = require(rootPath + '/public/js/libs/jsonTranslator.js');


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
			target: 'ja',
			key: 'AIzaSyCDGRwMxD9d4idsJVGa91FpApOyxlR5DMQ'
		},
		function(result)
		{
			object[property] = result[value];
			resultHandler.success();
		}
	);
}


JSONTranslator.translateJSON(
	lang,
	doGoogleTranslate,
	{
		success: function(json)
		{
			console.log(json);
			lang = json;
		},
		error: function(error)
		{
			console.log('GoogleTranslate.translateJSON error: ', error);
		}
	}
);


// console.log('JSONTranslator', JSONTranslator.translateJSON);


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

app.listen(port);

console.log('----------------------------------------------------');
console.log(' SERVER STARTED ON PORT ' + port);
console.log('----------------------------------------------------');
