/* Here we are talking about node of Tree definition 
 * and NodeData class define in soapWsdl for node.data.  
 * Not about xml node !!!
 */
angular.module('directivesDataP_m', [])

.factory('directivesDataP', ['appMessage','$log', 'wsdlDataP',
function(appMessage, $log, wsdlDataP) {
	
	//PRIVATE VARIABLES----------------------------------------------------------
	var MODULE_TAG = 'directivesDataP_m';
	
	//PRIVATE METHODS------------------------------------------------------------
	function getDocumentation(node) {
		var result = null;
		if(node.children.length === 1)
		   result = node.children[0].data.text; 
	    return (result === null) ? 'undocumented' : result;
	}		
	
	function getAttributeValue(attributeName,attributes) {
		for (var i=0; i < attributes.length; ++i) {
			if(attributes[i].name.localeCompare(attributeName) === 0)
			  return attributes[i].value;
		}
		return 'undefined';
	}
	//END OF PRIVATE METHODS-----------------------------------------------------

	//CLASSES -------------------------------------------------------------------
	function webServiceInfo(name){
		var that = this;
		that.name = name;
		that.operations = [];
	}
	
	function operationInfo(name,documentation){
		var that = this;
		that.name = name;
		that.documentation = documentation;
	}
	
	function RequestInfo() {
		var that = this;
		that.documentation = null;
		
		
		that.operation = null;
		that.name = null;
		
		that.forms = null;
	};
	//END CLASSES ----------------------------------------------------------------

	//PUBLIC METHODS--------------------------------------------------------------
    function getTableData(wsdlWsInfo){ 
	    try{
	    	var result = new webServiceInfo(getAttributeValue('name',wsdlWsInfo.data.attributes));
			var wsdlOperations = wsdlWsInfo.children;
			for (var i=0; i < wsdlOperations.length; ++i) {
			  var name = getAttributeValue('name',wsdlOperations[i].data.attributes);	
			  var documentation = getDocumentation(wsdlOperations[i]); 	
			  result.operations[i] = new operationInfo(name,documentation);
			}		
			return result;
	    } catch(e) {
	    	e = new appMessage.ExceptionMsg(MODULE_TAG,'getTableData', e.message);
			return e;
		}
	}
	
	function getOperationFormsData(wsdlMsgInfo){
		try{
			var result = new RequestInfo();
			var chidrenNodes = wsdlMsgInfo.children;
			for (var i=0; i < chidrenNodes.length; ++i) {
				if(chidrenNodes[i].data.name.localeCompare('documentation') === 0){
					result.documentation = getDocumentation(chidrenNodes[i]);
				}else{//we suppose that is part node !
					//TODO set result with get Part info
				}
			}	
		 } catch(e) {
	    	e = new appMessage.ExceptionMsg(MODULE_TAG,'getOperationFormsData', e.message);
			return e;
		}	
	}
	//END OF PUBLIC METHODS-----------------------------------------------------------

	//INTERFACE-----------------------------------------------------------------------
	return {
		getTableData: function(wsdlWsInfo){
			return getTableData(wsdlWsInfo);
		},
		getOperationFormsData: function(wsdlMsgInfo){
			return getOperationFormsData(wsdlMsgInfo);
		}
		
		
	};
	
}]);
