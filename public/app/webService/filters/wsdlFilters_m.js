/* Here we are talking about node of Tree definition 
 * and NodeData class define in soapWsdl for node.data.  
 * Not about xml node !!!
 */
angular.module('wsdlFilters_m', ['appMessage_m'])
.constant('MODULE_TAG', 'wsdlFilters_m')
.filter('toOperationsTable', ['MODULE_TAG','appMessage','$log','$cacheFactory',
function(MODULE_TAG, appMessage, $log, $cacheFactory) {
	var MODULE_TAG = 'MODULE_TAG';
	var result = null;
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
	
	//OPTIMIZATION
	function getChildNodeLocation(parentNode,childNodeName) {
		var childrenNode = parentNode.children;
		for (var i=0; i < childrenNode.length; ++i) {
			if( childrenNode[i].data.name.localeCompare('documentation') === 0 ){
				return i;
			}
		}
		return -1;
	}
	
	//WITHOUT OPTIMIZATION
	function getDocumentation(node) {
		var result = null;
		var nodeChildren = node.children;
		for (var i=0; i < nodeChildren.length; ++i) {
			if( nodeChildren[i].data.name.localeCompare('documentation') === 0 ){
				var result = nodeChildren[i].data.text; 
			}
		}
	    return (result === null) ? 'undocumented' : result;
	}		
	
	//WITH OPTIMIZATION
	function getDocumentation(node,docuPosition) {
		var result = null;
		if(docuPosition !== -1)
		   result = node.children[docuPosition].data.text; 
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
    
    function filter(wsdlWsInfo){ 
	    try{
	    	var formattedData = new webServiceInfo(getAttributeValue('name',wsdlWsInfo.data.attributes));
			var wsdlOperations = wsdlWsInfo.children;
			//OPTIMIZATION: ONLY IF ALWAYS IN THE SAME CHILD PLACE :	
			if(wsdlOperations.length > 0)
				var docuLocation = getChildNodeLocation(wsdlOperations[0],'documentation');
			for (var i=0; i < wsdlOperations.length; ++i) {
			  var name = getAttributeValue('name',wsdlOperations[i].data.attributes);	
			  var documentation = getDocumentation(wsdlOperations[i],docuLocation); 	
			  formattedData.operations[i] = new operationInfo(name,documentation);
			}		
			return formattedData;
	    } catch(e) {
	    	e = new appMessage.ExceptionMsg(MODULE_TAG,'filter', e.message);
			$log.error(e.toString());
			return false;
		}
	}
	
	//-------------------------------------------------------------------------------------------------
	/*
	 * ISSUE: if the filter creating a new object every time it's run => endLess $digest call !!!
	 * 		  when the application's model becomes unstable and each $digest cycle triggers a state 
	 * 		  change and subsequent $digest cycle.
	 * 
	 * RESOLUTION: call $cacheFactory or return var instead of function !
	 * 
	 * WARNING: If the values change frequently though then you should check 
	 * 			if $cacheFactory discards old results to avoid a memory leak over time.
	 * 
	 * RESOLUTION: To avoid memory leak, i clear the result cache a soon as $digest is done using
	 *             $timeout(fn, delay, false) with function fn(){ $cacheFactory.cache = {} }
	 * 			   Set 3rd parameter to false, otherwise it will trigger $digest again.
	 * 			 
	 */
	return function(wsdlWsInfo){	
		if(result === null)
			result = filter(wsdlWsInfo);
		return result;
	}
}]);
