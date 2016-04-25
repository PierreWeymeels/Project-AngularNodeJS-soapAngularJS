angular.module('soapRequest_m', [])

//CONFIG/////////////////////////////////////////////////////////////////////////
.config(['soapRequestProvider','$httpProvider',
function(soapRequestProvider,$httpProvider) {
	delete $httpProvider.defaults.transformRequest;
	console.log('defaults.transformRequest deleted !');

	//$httpProvider.interceptors.push('httpInterceptor');
	//miriadeSoapWSProvider.providerMethod...
	//$httpProvider.

}])

//RUN////////////////////////////////////////////////////////////////////////////
.run(function() {
	/*var injector = angular.injector(['$http']);
	 var thttp = injector.get('$http');*/
})

//PROVIDER///////////////////////////////////////////////////////////////////////
.provider('soapRequest', function() {

	//soapRequestProvider data----------------------------------------------------------
	var http;
	var httpInterceptor = {
		
	};

	this.providerMethod = function(value) {

	};

	//wsdlDataP-----------------------------------------------------------------------
	this.$get = ['$log', 'appMessage',
		function($log, appMessage) {
			
			var namespace = 'http://vo.imcce.fr/webservices/miriade';
		var uriwsdl = namespace.concat('/miriade.wsdl');

		var nasaWsdl = 'http://cdaweb.gsfc.nasa.gov/WS/jaxrpc?WSDL';

		function endSaveProduct(xmlHttpRequest, status) {
			var xmlDoc = xmlHttpRequest.responseXML
			var docNode = xmlDoc.documentElement.childNodes;
			var x = xmlDoc.getElementsByTagName("ARTIST");

		}

		function requestConfig(method, url, soapMsg) {
			var rqtConfig = {
				method : method,
				url : url,
				data : soapMsg,
				headers : { //'Accept' : "text/xml",  'Accept-Encoding' : 'chunked',
					'Content-Type' : "text/plain;charset=\"utf-8\"",	
				},
				//params: {WSDL: ""},
				//responseType: "",
				transformResponse : function(respData) {
					var parser = new DOMParser();
					respData = parser.parseFromString(respData, "text/xml");
					$log.debug('response:   ', respData);
					//document xml
					return respData;
				}
			};
			return rqtConfig;
		}

		function nasaSoap() {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			var call = new SOAPCall();
			call.transportURI = "http://sscweb.gsfc.nasa.gov/WS/jaxrpc";
			call.encode(0, "getAllSatellites", "http://sscweb.gsfc.nasa.gov/WS/SSCWS", 0, null, 0, null);
			var response = call.invoke();
			if (response.fault == null) {
				var result = response.getParameters(true, {});
				for ( i = 0; i != result.length; i++) {
					var param = result[i];
					var name = param.name;
					document.write("result[" + i + "].name = " + name + "<br>");
					var value = param.value;
					for ( j = 0; j < value.length; j++)
						document.write("value[" + j + "] = " + value[j] + "<br>");
				}
				return true;
			}
			return false;
		}

		//INTERFACE-----------------------------------------------------------------------
		return {
			loadWsdl : function() {
				return $http(requestConfig('get', uriwsdl, null)); //nasaSoap(); 
				
			},
			get : function(operationData) {

				var soapMsg = miriadeSoapMS.getSoapMsg(operationData);

				var req = {
					method : 'POST',
					url : 'http://vo.imcce.fr/webservices/miriade/getAvailability',
					data : soapMsg,
					headers : {
						'Content-Type' : "text/plain;charset=\"utf-8\"",
					},
					//responseType: "",
					transformResponse : function(response) {
						var parser = new DOMParser();
						response = parser.parseFromString(response, "text/xml");
						//var t = response.responseXML
						return miriadeSoapMS.responseToHtml(response);
					}
				}
				return $http(req);
			}
		};

	}];

});

