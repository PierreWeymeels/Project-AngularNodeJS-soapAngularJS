/* Here we are talking about node of Tree definition 
 * and NodeData class define in soapWsdl for node.data.  
 * Not about xml node !!!
 * So wsdl...Tree are tree type info and not a part of wsdl file!
 * wsdlValue means with prefix:suffix
 */
angular.module('directivesDataP_m', [])

.factory('directivesDataP', [ 'appMessage','$log', 'wsdlDataP',
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
		try{
			for (var i=0; i < attributes.length; ++i) {
				if(attributes[i].name.localeCompare(attributeName) === 0)
				  return attributes[i].value;
			}
			return 'undefined'; //TODO change the model to accept undefined without quote to throw error when necessary ! 
		} catch(e) {
	    	throw appMessage.allocateError(e, MODULE_TAG, 'getAttributeValue', false);
		}
	}
	
	function getPartInfo(partAttributes){
		try{
			var result = new PartInfo(getAttributeValue('name', partAttributes));
			var wsdlType = getAttributeValue('type', partAttributes);
			var form = new FormInfo();
			if(wsdlDataP.isSimpleType(wsdlType))
				setSimpleFormInfo(form, result.name, wsdlType);
		 	else 
				setFormInfo(form, wsdlDataP.getComplexTypeTreeInfo(wsdlType, null));
			result.form.push(form);	
			return result;
		} catch(e) {
	    	throw appMessage.allocateError(e, MODULE_TAG, 'getPartInfo', false);
		}
	}
	
	function setSimpleFormInfo(form,name,wsdlType){
		try{
			form.name = name+' simple form';
			form.documentation = 'Part '+name+' simple form.';
			var imput = getImputInfo(name, wsdlType);
			form.defaultImputsResp[imput.name] = imput.value;	
			form.imputs.push(imput);
		} catch(e) {
	    	throw appMessage.allocateError(e, MODULE_TAG, 'setSimpleFormInfo', false);
		}
	}
	
	/*
	 * @return part.form
	 * by recurcive call.
	 * TODO simplify by dividing in sub-functionality
	 */
	function setFormInfo(form, wsdlComTypTree){
		try{	
			var extension = existAndGetFirstNode(wsdlComTypTree, 'extension');
			if(extension.exist){
				var wsdlbaseValue = getAttributeValue('base', extension.node.data.attributes);
				wsdlComTypTree = wsdlDataP.getComplexTypeTreeInfo(wsdlbaseValue, null);
				//recall:
				setFormInfo(form, wsdlComTypTree); 
			}else{
				var restriction = existAndGetFirstNode(wsdlComTypTree, 'restriction');
				if(restriction.exist){
					var complexTypeName = getAttributeValue('name',wsdlComTypTree._root.data.attributes);
					var result = wsdlDataP.getRestrictAndTypeOfAttribute(complexTypeName);
					form.restrictSeq.push(result.restrictValue);
					if(result.isSimple){
						form.name = getAttributeValue('name', wsdlComTypTree._root.data.attributes);
						form.imputs.push(getImputInfo(result.type,result.type));
					}else{
						wsdlComTypTree = wsdlDataP.getComplexTypeTreeInfo(result.type, null);
						//recall:
						setFormInfo(form, wsdlComTypTree);
					}
				
				}else{
					//TODO getIMPUTS	form.imputs
					form.name = getAttributeValue('name', wsdlComTypTree._root.data.attributes);
					var elementsNode = getNodes(wsdlComTypTree,'element');
					for (var i=0; i < elementsNode.length; ++i) {
						var elementAttributes = elementsNode[i].data.attributes;
						var wsdlElemType = getAttributeValue('type',elementAttributes);
						if(wsdlDataP.isSimpleType(wsdlElemType)){
							var imput = getImputInfo(elementAttributes);
							form.defaultImputsResp[imput.name] = imput.value;	
							form.imputs.push(imput);
						}else{
							var subForm = new FormInfo();
							var subWsdlComTypTree = wsdlDataP.getComplexTypeTreeInfo(wsdlElemType, null);
							//recall:
							setFormInfo(subForm, subWsdlComTypTree);
							form.forms.push(subForm);
						}		
					}
				}
			}
		} catch(e) {
	    	throw appMessage.allocateError(e, MODULE_TAG, 'setFormInfo', false);
		}
	}
	
	function getNodes(tree, nodeName){
		try{
			var result = [];
			tree.contains(
				function(node){
				  if(node.data.name === nodeName)
				  	result.push(node);
				},tree.traverseBF
			);
			return result;
		} catch(e) {
	    	throw appMessage.allocateError(e, MODULE_TAG, 'getNodes', false);
		}
	}	
	
	function existAndGetFirstNode(tree, nodeName){
		try{
			//!!! no declared var node could throw exception !!!
			var result = {'exist': false, 'node': null};
			tree.contains(
				function(node){
				  if(node.data.name === nodeName)
				  	return {'exist': true, 'node': node};//TODO CHECK if this callback doesn't go on after !
				},tree.traverseBF
			);
			return result;	
		} catch(e) {
	    	throw appMessage.allocateError(e, MODULE_TAG, 'existAndGetFirstNode', false);
		}
	}
	
	/*
	 * only for simple type !!!
	 * work with wsdlType and xmlType ! 
	 */
	function getImputInfo(name,wsdlType){
		try{
			var result = new ImputInfo();
			result.name = name;
			setHtmlType(getXmlType(wsdlType),result);
			return result;
		} catch(e) {
	    	throw appMessage.allocateError(e, MODULE_TAG, 'getImputInfo(name,wsdlType)', false);
		}
	}
	
	/*
	 * only for simple type !!!
	 */
	function getImputInfo(attributes){
		try{
			var result = new ImputInfo();		
			var hasDefault = false;	
			var wsdlType = getAttributeValue('type', attributes);		
			setHtmlType(getXmlType(wsdlType),result);
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
				result.value = getDefaultValue(null, result.type);
			return result;
		} catch(e) {
	    	throw appMessage.allocateError(e, MODULE_TAG, 'getImputInfo(attributes)', false);
		}
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
				if(!isAndSetNumberType(xmlType,imputInfo))
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
		that.form = [];
	};
	
	function FormInfo(){
		var that = this;
		that.name = name;
		that.restrictSeq= [];
		that.documentation = 'undocumented';
		that.forms = [];
		that.imputs = [];
		that.defaultImputsResp = {};
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
    function getOpeTableData(wsdlPortTypeTree){ 
	    try{
	    	var wsdlWsInfo = wsdlPortTypeTree._root;
	    	var result = new webServiceInfo(getAttributeValue('name',wsdlWsInfo.data.attributes));
			var wsdlOperations = wsdlWsInfo.children;
			for (var i=0; i < wsdlOperations.length; ++i) {
			  var name = getAttributeValue('name',wsdlOperations[i].data.attributes);	
			  var documentation = getDocumentation(wsdlOperations[i]); 	
			  result.operations[i] = new operationInfo(name,documentation);
			}		
			return result;
	    } catch(e) {
	    	throw appMessage.allocateError(e, MODULE_TAG, 'getOpeTableData', false);
		}
	}
	
	function getMsgPartsData(operationName, wsdlMsgTree){
		try{
			var wsdlMsgInfo = wsdlMsgTree._root;
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
		 	throw appMessage.allocateError(e, MODULE_TAG, 'getMsgPartsData', false);
		}	
	}
	//END OF PUBLIC METHODS-----------------------------------------------------------

	//INTERFACE-----------------------------------------------------------------------
	return {
		getOpeTableData: function(wsdlPortTypeTree){
			return getOpeTableData(wsdlPortTypeTree);
		},
		getMsgPartsData: function(operationName, wsdlMsgTree){
			return getMsgPartsData(operationName, wsdlMsgTree);
		}		
	};
	
}]);
