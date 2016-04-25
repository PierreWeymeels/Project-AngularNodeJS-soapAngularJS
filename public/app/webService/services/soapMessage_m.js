angular.module('soapMessage_m', ['appMessage_m']).factory('soapMessage', ['$log', 'appMessage',
function($log, appMessage) {
	//SOAP MESSAGE-------------------------------------------------------------------------
	var soapMsgConfig = {
		'targetNamespace' : null,
		'header' : false,
		'request' : null,
		imputs : [{
			'element' : 'null',
		}],
	};
	var soapMsg = '<?xml version="1.0" encoding="UTF-8"?> ' + '<SOAP-ENV:Envelope ' + //soap
	'xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" ' + //
	'xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" ' + //
	'xmlns:tns=' + soapMsgConfig.targetNamespace + '> ' + //targetNamespace or namespace
	soapMsgConfig.header + '<SOAP-ENV:Body> ' + '<tns:' + soapMsgConfig.request + '> ' + //message namespace:name
	soapMsgConfig.imputs + '<mime>xml</mime> ' + '</tns:' + soapMsgConfig.request + '> ' + '</SOAP-ENV:Body> ' + '</SOAP-ENV:Envelope>';

	//-------------------------------------------------------------------------------------
	function setSoapMsgConfig() {
		var rootNode = wsdl_xmlDoc.documentElement;
		//definition node
		soapMsgConfig.targetNamespace = rootNode.getAttribute("targetNamespace");
		soapMsgConfig.header = getHeader();
	}
	function getHeader() {//TODO set in function of operation !
		var header = '<SOAP-ENV:Header> ' + '<tns:clientID> ' + '<from>angularClient</from> ' + '<hostip>127.0.0.1/</hostip> ' + '<lang>en</lang> ' + '</tns:clientID> ' + '</SOAP-ENV:Header> ';
		return header;
	}
	//-----------------------------------------------------------------------

	return {
		
	};

}]);
