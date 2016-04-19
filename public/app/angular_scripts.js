var fs = require('fs');

//if you want to show type object into console.log:
//var util = require('util');

module.exports = function (app, express) {
		var scriptRouter = express.Router();
		
		var angular_scripts = [
				'/home/controllers/homeC_m.js',
				'/webService/controllers/webServiceC_m.js',
				'/webService/directives/fileDialog_m.js','/webService/directives/operationsTable_m.js',
				'/webService/directives/messageParts_m.js','/webService/directives/messageForm_m.js', 
				'/webService/directives/accordion_m.js',
				'/webService/services/directivesDataP_m.js',
				'/webService/services/soapService_m.js','/webService/services/wsdlDataP_m.js', 
				'/webService/services/soapMessage_m.js','/webService/services/soapRequest_m.js',
				'/main_scripts/appRoutes_m.js','/main_scripts/appMessage_m.js','/main_scripts/app_m.js' 
		];

		scriptRouter.get('/', function (req, res) {
				console.log('angular_scripts');
				var data="\"use strict\"; \n";
				for (var i = 0; i < angular_scripts.length; i++)
				{
						data += fs.readFileSync(__dirname + angular_scripts[i]);
						data += "\n";
						data += "//----------------------------------------------------------------------- \n \n";
				}

				res.end(data);
				data = "";
				//console.log(util.inspect(data, {showHidden: false, depth: null}));
		});

		return scriptRouter;
};