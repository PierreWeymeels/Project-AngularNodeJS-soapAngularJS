/* Here we are talking about node of Tree definition 
 * and NodeData class define in soapWsdl for node.data.  
 * Not about xml node !!!
 */
angular.module('treeFilters_m', ['appMessage_m'])

.factory('treeFilters', ['appMessage','$log',
function(appMessage, $log) {
	var MODULE_TAG = 'treeFilters_m';
	//business classes and methods:------------------------------------------------------------------
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
	//-------------------------------------------------------------------------------------------------
    
    function getTableData(wsdlWsInfo){ 
	    try{
	    	var formattedData = new webServiceInfo(getAttributeValue('name',wsdlWsInfo.data.attributes));
			var wsdlOperations = wsdlWsInfo.children;
			for (var i=0; i < wsdlOperations.length; ++i) {
			  var name = getAttributeValue('name',wsdlOperations[i].data.attributes);	
			  var documentation = getDocumentation(wsdlOperations[i]); 	
			  formattedData.operations[i] = new operationInfo(name,documentation);
			}		
			return formattedData;
	    } catch(e) {
	    	e = new appMessage.ExceptionMsg(MODULE_TAG,'getTableData', e.message);
			return e;
		}
	}
	//-------------------------------------------------------------------------------------------------
	
	return {
		getTableData: function(wsdlWsInfo){
			return getTableData(wsdlWsInfo);
		},
		
		
	};
	
}]);
