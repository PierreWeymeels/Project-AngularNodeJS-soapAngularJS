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
		return 'undefined'; //TODO change the model to accept undefined without quote to throw error when necessary ! 
	}
	
	function getPartInfo(partAttributes){
		var result = new PartInfo(getAttributeValue('name', partAttributes));
		var wsdlType = getAttributeValue('type', partAttributes);
		if(wsdlDataP.isSimpleType(wsdlType))
			result.element = getImputInfo(result.name, wsdlType);
		else  
			result.form = getFormInfo(wsdlDataP.getComplexTypeTreeInfo(wsdlType, null));
		return result;
	}
	
	function getImputInfo(name,wsdlType){
		var result = new ImputInfo();
		result.name = name;
		setHtmlType(getXmlType(wsdlType),result);
		return result;
	}
	
	function getFormInfo(wsdlComplexTypeInfo){
		var result = new FormInfo();
		
		return result;
	}
	
	function getImputInfo(attributes){
		var result = new ImputInfo();		
		var hasDefault = false;
		var xmlType = getXmlType(wsdlType);
		var wsdlType = getAttributeValue('type', attributes);	
		setHtmlType(wsdlType,result); 		
		for (var i = 0; i < attributes.length; ++i) {	
			var name = attributes[i].name;
			switch(name) {
				case 'minOccurs':
					result.required = (attributes[i].value == 1);
					break;
				case 'default':
					result.value = 
						getDefaultValue(attributes[i].value, result.type);
					hasDefault = true;
					break;
				default:
					if (result.hasOwnProperty(name) && (name.localeCompare('type') !== 0))
						result[name] = attributes[i].value;
			}
		}
		if(!hasDefault)
			result.value = getDefaultValue(null, result.type));
		return result;
	}
	
	function getXmlType(wsdlType){
		var type = wsldType.split(":");
		return type[type.length - 1];
	}
	
	function setHtmlType(xmlType,imputInfo) {
		switch(xmlType) {
			case 'string':
				imputInfo.type = 'text';
				break;
			case 'boolean':
				imputInfo.type = 'checkbox';
				break;
			default:{
				if(!isAndSetNumberType(xmlType,imputInfo)){
					imputInfo.type = xmlType;
			}				
		}
	}
	
	function isAndSetNumberType(xmlType,imputInfo){
		var itIs = false;
		switch(xmlType) {
			case 'int':
				itIs = true;
				imputInfo.step = "1";
				break;
			case 'long':
				itIs = true;
				imputInfo.step = "1";
				break;	
			case 'float':
				imputInfo.step = "any";
				itIs = true;	
		}
		if(itIs){
			imputInfo.type = 'number';
		}
		return itIs;
	}
	
	//TODO be careful not general enough !
	function getDefaultValue(defaultValue, htmltype) {
		switch(htmltype) {
		case 'text':
			return ((defaultValue == null) ? "" : defaultValue);
		case 'number':
			return ((defaultValue == null) ? 0 : parseInt(defaultValue));
		case 'checkbox':
			return (defaultValue == "true");
		default:
			return ((defaultValue == null) || (defaultValue == undefined) ? "" : defaultValue);
		}
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
	
	function MessageRequestInfo(operation,message) {
		var that = this;
		that.operation = operation;
		that.message = message;
		that.documentation = 'undocumented';
	    that.parts = [];
	};
	
	function PartInfo(name) {
		var that = this;
		that.name = name;
		that.form = false;
		that.element = false;
	};
	
	function FormInfo(){
		var that = this;
		that.name = name;
		that.restriction = false;
		that.documentation = 'undocumented';
		that.forms = [];
		that.elements = [];
	}
	
	function ImputInfo(){
		var that = this;
		that.name = '';
		that.type = '';
		that.step = '';
		that.required = false;
		that.value = '';
		that.format = '';
		that.description = 'undocumented';
		
	}
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
	    	throw appMessage.allocateError(e, MODULE_TAG, 'getTableData', false);
		}
	}
	
	function getOperationFormsData(operationName, wsdlMsgInfo){
		try{
			var result = new MessageRequestInfo(operationName,getAttributeValue('name',wsdlMsgInfo.data.attributes));
			var chidrenNodes = wsdlMsgInfo.children;
			for (var i=0; i < chidrenNodes.length; ++i) {
				if(chidrenNodes[i].data.name.localeCompare('documentation') === 0){
					result.documentation = getDocumentation(chidrenNodes[i]);
				}else if(chidrenNodes[i].data.name.localeCompare('part') === 0){
					result.parts.push(getPartInfo(chidrenNodes[i].data.attributes));
				}else
					throw {'message': 'Unsupported message node !'};
			}	
			return result;
		 } catch(e) {
		 	throw appMessage.allocateError(e, MODULE_TAG, 'getOperationFormsData', false);
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
