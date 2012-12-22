
var rootPath = __dirname + '/..';
var port = 3000;

var express = require('express');
var fs = require('fs');
var handlebars = require('handlebars');
var templater = require(rootPath + '/server/templater.js');

templater.initialize(function(){
	console.log('templater.initialize success');
});

var app = express();
//Set the publicd fodler
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

app.get('/', function(request, response)
{
	var output = templater.compile(
		'index',
		{
			message:'This is dynamic!'
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
