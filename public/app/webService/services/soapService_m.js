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
				var pttData	= wsdlDataP.getPortTypeTreeInfo('operation','documentation');
				return {
					'error' : false,
					'data' : directivesDataP.getTableData(pttData)
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
			var wsdlMsgInfo = wsdlDataP.getMessageTreeInfo(operationName, 'input');
			return {
				'error' : false,
				'data' : directivesDataP.getOperationFormsData(operationName, wsdlMsgInfo)
			};
		} catch(e) {
			return {
				'error' : true,
				'data' : appMessage.allocateError(e, MODULE_TAG, 'getMsgRequestInfo', true)
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
		}
	};

}]);

