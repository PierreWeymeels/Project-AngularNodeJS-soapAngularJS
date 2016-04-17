angular.module('soapService_m',['directivesDataP_m', 'soapRequest_m', 'wsdlDataP_m', 'soapMessage_m'])
.factory('soapService', ['$log','appMessage','directivesDataP', 'soapRequest', 'wsdlDataP', 'soapMessage',
function($log, appMessage, directivesDataP, soapRequest, wsdlDataP, soapMessage) {
	
	//PRIVATE VARIABLES----------------------------------------------------------
	var MODULE_TAG = 'soapService_m';
	
	//PRIVATE METHODS------------------------------------------------------------
	function allocateError(e, MODULE_TAG, method) {
		if ( e instanceof appMessage.UserMsg)
			return e._toString();
		else {
			if (!( e instanceof appMessage.ExceptionMsg))
				e = new appMessage.ExceptionMsg(MODULE_TAG, method, e.message);
			$log.error(e._toString());
			var userMsg = new appMessage.UserMsg('fatal error', 'from soap service');
			return userMsg._toString();
		}
	}

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
				'data' : allocateError(e, MODULE_TAG, 'getWebService')
			};
		}
	}

	function getRequestInfo(operationName) {
		try {
			var wsdlMsgInfo = wsdlDataP.getMessageTreeInfo(operationName, 'input');
			return {
				'error' : false,
				'data' : directivesDataP.getOperationFormsData(wsdlMsgInfo);
			};
		} catch(e) {
			return {
				'error' : true,
				'data' : allocateError(e, MODULE_TAG, 'getRequestInfo')
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
		getRequestInfo : function(operationName) {
			return getRequestInfo(operationName);
		}
	};

}]);

