var express = require('express');
var hbs = require('hbs');
var port = 3000;

var app = express();

app.use(express.methodOverride());

app.configure(function(){
  
  app.use(express.bodyParser());

  

});

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
/////////////////////////////////////////////////////////////////

// var users = require('./data/users.js');

app.get('/', function(request, response)
{
	response.send('Hello I\'m the mock server');
});



/////////////////////////////////////////////////////////////////
// STARTUP

app.listen(port);

console.log('----------------------------------------------------');
console.log(' SERVER STARTED ON PORT ' + port);
console.log('----------------------------------------------------');
