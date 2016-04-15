angular.module('soapService_m', ['appMessage_m', 'soapRequest_m', 'soapWsdl_m', 'soapForm_m'])
.constant('MODULE_TAG', 'soapService_m')
.factory('soapService', ['MODULE_TAG', '$log', 'appMessage', 'soapRequest', 'soapWsdl', 'soapForm',
function(MODULE_TAG, $log, appMessage, soapRequest, soapWsdl, soapForm) {
	//CLASSES -------------------------------------------------------------
	function RequestInfo() {
		var that = this;
		that.operation = null;
		that.name = null;
		that.documentation = null;
		that.forms = null;
	};

	//PRIVATE METHODS------------------------------------------------------------------
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

	//PUBLIC METHODS------------------------------------------------------------------
	function getWebService(wsdl) {
		try {
			if (soapWsdl.initializeWsdl(wsdl)) {
				return {
					'error' : false,
					'data' : soapWsdl.getPortTypeTreeInfo()
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
			var result = new RequestInfo();
			result.operation = operationName;
			var msgInfo = soapWsdl.getMessageTreeInfo(operationName, 'input');
			result.name = msgInfo.name;
			result.documentation = msgInfo.documentation;
			var partsInfo = msgInfo.parts;
			if(partsInfo.length === 0){
				result.forms = [];
				//TODO send soap request !
			}else{
				//TODO from parts to forms !
			}
			


			return {
				'error' : false,
				'data' : result
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
