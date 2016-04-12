// CALL THE PACKAGES AND INITIALIZE ----------------------------------------------
var express = require('express'); 
var app = express(); // define our app using express
var bodyParser = require('body-parser'); 
var morgan = require('morgan'); // used to see requests
var config = require('./config');
var path = require('path');

// APP CONFIGURATION ----------------------------------------------

app.use(bodyParser.urlencoded({extended: true}));//url to json parser
app.use(bodyParser.json());// parse application/json 

// configure our app to handle CORS requests
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, \Authorization');
  next();
});

// log all requests to the console
app.use(morgan('dev'));


// set static files location used for requests that our frontend will make
app.use(express.static(__dirname + '/public'));

// ROUTES------------------------------------------
var angular_scriptsRoute = 
		require('./public/app/angular_scripts')(app, express);
app.use('/app/angular_scripts', angular_scriptsRoute);


// send users to frontend:
/*
 It is important to put this route after
 the API routes since we only want it to catch routes not handled by Node.
 */
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/app/home/views/index.html'));
  console.log('get /');
});
//------------------------------------------------

// START THE SERVER
app.listen(config.port);
console.log('Listen on port ' + config.port);