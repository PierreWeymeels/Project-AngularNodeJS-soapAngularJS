angular.module('soapService_m',['directivesDataP_m', 'soapRequest_m', 'wsdlDataP_m', 'soapMessage_m'])
.factory('soapService', ['$log','appMessage','directivesDataP', 'soapRequest', 'wsdlDataP', 'soapMessage',
function($log, appMessage, directivesDataP, soapRequest, wsdlDataP, soapMessage) {
	
	//PRIVATE VARIABLES----------------------------------------------------------
	var MODULE_TAG = 'soapService_m';
	
	//PRIVATE METHODS------------------------------------------------------------

	//PUBLIC METHODS---------------------------------------------------------------
	function getWebService(wsdl) {
		try {
			if (wsdlDataP.initializeWsdl(wsdl)) {
				var wsdlPortTypeTree = wsdlDataP.getPortTypeTreeInfo('operation','documentation');
				return {
					'error' : false,
					'data' : directivesDataP.getOpeTableData(wsdlPortTypeTree)
				};
			}
		} catch(e) {
			return {
				'error' : true,
				'data' : appMessage.allocateError(e, MODULE_TAG, 'getWebService', true)
			};
		}
	}

	function getMsgRequestInfo(operationName) {
		try {
			var wsdlMsgTree = wsdlDataP.getMessageTreeInfo(operationName, 'input');
			return {
				'error' : false,
				'data' : directivesDataP.getMsgPartsData(operationName, wsdlMsgTree)
			};
		} catch(e) {
			return {
				'error' : true,
				'data' : appMessage.allocateError(e, MODULE_TAG, 'getMsgRequestInfo', true)
			};
		}
	}
  
  function getServerAnswer(msgUserSubmit){
    try {
			var soapMsg = soapMessage.getSoapMsg(msgUserSubmit);
			return {
				'error' : false,
				'data' : soapRequest.getServerAnswer(soapMsg)
			};
		} catch(e) {
			return {
				'error' : true,
				'data' : appMessage.allocateError(e, MODULE_TAG, 'getServerAnswer', true)
			};
		}
  }
	//END OF PUBLIC METHODS-----------------------------------------------------------

	//INTERFACE-----------------------------------------------------------------------
	/*
	 * @return {error:boolean,data:...}
	 */
	return {
		getWebService : function(wsdl) {
			return getWebService(wsdl);
		},
		getMsgRequestInfo : function(operationName) {
			return getMsgRequestInfo(operationName);
		},
    getServerAnswer: function(msgUserSubmit){
      return getServerAnswer(msgUserSubmit);
    },
	};

}]);

