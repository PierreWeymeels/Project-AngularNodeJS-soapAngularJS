angular.module('wsdlDataP_m', [])

//CONFIG/////////////////////////////////////////////////////////////////////////
.config(['wsdlDataPProvider',
function(soapWsdlProvider) {
	//TODO set this synchronous:
	require(['../app/webService/services/libs/treeLib'], //['wslibs/treeLib'],
	function(treeLib) {
		soapWsdlProvider.treeLib = treeLib;
	}, function(err) {
		soapWsdlProvider.treeLib = err.message;
	});
}])

//RUN////////////////////////////////////////////////////////////////////////////
.run(function() {

})

//PROVIDER///////////////////////////////////////////////////////////////////////
.provider('wsdlDataP', function() {

	//wsdlDataPProvider data----------------------------------------------------------
	this.treeLib = null;

	//wsdlDataP-----------------------------------------------------------------------
	this.$get = ['$log', 'appMessage',
	function($log, appMessage) {
		//PRIVATE VARIABLES----------------------------------------------------------
		var MODULE_TAG = 'wsdlDataP_m';
		var wsdlDefNode = null;
		var treeLib = this.treeLib;

		//PRIVATE METHODS------------------------------------------------------------
		function getSoapBindingValue(attribute) {
			var bindingNode = wsdlDefNode.getElementsByTagName("binding")[0];
			var soapBindingNode = bindingNode.getElementsByTagName("binding")[0];
			return soapBindingNode.getAttribute(attribute);
		}
		
		function getNodeData(node){
			var result = new NodeData(node.nodeName,getAttributesInfo(node));
			result.text = getText(node);
			return result;
			
		}
		
		function getAttributesInfo(node) {
			var result = [];
			var attributes = node.attributes;
			for (var i = 0; i < attributes.length; ++i) {
				result[i] = new AttributeInfo(attributes[i].name, attributes[i].value);
			}
			return result;
		}
		
		function getText(node){
			var cN = node.firstChild;
			if((cN !== null)&&(cN.nodeType === 3))
				return cN.nodeValue;
			return null;
		}
		
		function getTree(parentXmlNode,childrenName,grandChildrenName){
			var result = new treeLib.Tree(getNodeData(parentXmlNode)); 
			addChildTree(result._root,parentXmlNode,childrenName,grandChildrenName);
			return result;
		}
		
		function addChildTree(parentTreeNode,parentXmlNode,childrenName,grandChildrenName){
			var childrenXmlNode;
			if(childrenName !== null)
			  childrenXmlNode = parentXmlNode.getElementsByTagName(childrenName);
			else
			  childrenXmlNode = parentXmlNode.children;
			for (var i = 0; i < childrenXmlNode.length; ++i) {
					parentTreeNode.addChild(getNodeData(childrenXmlNode[i]));
					if (childrenXmlNode[i].children.length !==0){
						addChildTree(parentTreeNode.children[i],childrenXmlNode[i],grandChildrenName,null)
					}  
			}
		}
		
		/* 
		 * work with wsdlType and xmlType ! 
	     */
		function getName(value, prefixSeparator, suffixValue) {
			var name = value;
			if (prefixSeparator !== null) {
				name = name.split(prefixSeparator);
				name = name[name.length - 1];
			}
			if (suffixValue !== null) {
				var suffixL = suffixValue.length;
				var nameL = name.length;
				name = name.substring(0, nameL - suffixL);
			}
			return name;
		}
		
		/*
		 * nodetag = imput or output
		 */
		function getOpeMsgAttribValue(operationName, nodetag) {
			var portTypeNode = wsdlDefNode.getElementsByTagName("portType")[0];
			var operationNode = getNodeByAttribute(portTypeNode, 'name', operationName);
			var node = operationNode.getElementsByTagName(nodetag)[0];
			return node.getAttribute("message");
		}
		
		function getNodeByAttribute(parentNode, attribute, value) {
			var children = parentNode.children;
			for (var i = 0; i < children.length; ++i) {
				var attributeValue = children[i].getAttribute("name");
				if (value.localeCompare(attributeValue) == 0) {
					return children[i];
				}
			}
			return null;
		}
		
		//TODO consider case value= xsd... without :
		function isType(typeValue, prefixe) {
			return (typeValue.split(':')[0] == prefixe)
		}
		
		function isWithoutPrefixe(typeValue) {
			return (typeValue.split(':').length === 1);
		}
		
		//TODO select by specific shema :
		function getComplexTypeNode(nameValue) {
			var result;
			var schemaNodes = wsdlDefNode.getElementsByTagName("schema");
			for (var i = 0; i < schemaNodes.length; ++i) {
				result = getNodeByAttribute(schemaNodes[i], 'name', nameValue);
				if (result !== null)
					return result;
			}
			throw new appMessage.ExceptionMsg(MODULE_TAG, 'getComplexTypeNode', 'complexTypeNode: ' + nameValue + ' = null');
		}
		
		//TODO with xmlns analysis !!!
		function getRestrictionValue(restrictionNode){
			var base = getNodeAttributeValue(attributesNode, 'base');
			var restriction = getName(base, ':', null);
			return restriction;
						
		}
		
		/*
		 * @return {'type': xsd type (string) || complexTypeName, 'isSimple': boolean} 
		 * 
		 * TODO generalize this with xmlns analysis !!!
		 */
		function getTypeOfAttributeNode(attributesNode,restrictionValue){
			if(restrictionValue.localeCompare('Array') ===0)
			  var suffixe = '[]';
			else
			  throw  new appMessage.ExceptionMsg(MODULE_TAG, 'getTypeOfAttributeNode', 'Unsupported restrictionValue !'); 
			var ref = getNodeAttributeValue(attributesNode, 'ref');
			var name = 'wsdl:'+ref.getSuffix(':');
			var wsdlType = getNodeAttributeValue(attributesNode, name);
			return {'type': isSimpleType(wsdlType), 'isSimple': getName(wsdlType, ':', suffixe)} ;
		}
		
		function getNodeAttributeValue(node, name) {
			var attribute = node.getAttributeNode(name);
			return attribute.value;
		}
		
		function getPrefix(prefixSeparator){
			var result =  this.split(prefixSeparator);
			return result[0];
		}
		
		function getSuffix(prefixSeparator){
			var result =  this.split(prefixSeparator);
			return result[result.length-1];
		}
		//END OF PRIVATE METHODS-------------------------------------------------------------

		//CLASSES ---------------------------------------------------------------------------
		function NodeData(name, attributes) {
			var that = this;
			that.name = name;
			that.attributes = attributes;
			that.text = null;
		}
		
		function AttributeInfo(name, value) {
			var that = this;
			that.name = name;
			that.value = value;
		}
		//END CLASSES ------------------------------------------------------------------------

		//PUBLIC METHODS------------------------------------------------------------------
		//USED BY soapService:-----------------
		function initializeWsdl(newWsdl) {
			try {
				$log.debug('treeLib', treeLib);
				wsdlDefNode = newWsdl.documentElement;
				var style = getSoapBindingValue('style');
				var transport = getSoapBindingValue('transport');
				if ((style.localeCompare("rpc") === 0) && (transport.localeCompare("http://schemas.xmlsoap.org/soap/http") === 0)) {
					return true;
				} else {
					wsdlDefNode = null;
					throw new appMessage.UserMsg('Not supported', 'Only rpc style and http transport supported !');
				}
			} catch(e) {
				wsdlDefNode = null;
				throw appMessage.allocateError(e, MODULE_TAG, 'initializeWsdl', false);
			}
		}

		/*
		 * @return
		 * portType nodes tree attributes info !
		 */
		function getPortTypeTreeInfo(childrenName,grandChildrenName) { 
			try {	
				var portTypeNode = wsdlDefNode.getElementsByTagName("portType")[0];
				return getTree(portTypeNode,childrenName,grandChildrenName);	
			} catch(e) {
				throw appMessage.allocateError(e, MODULE_TAG, 'getPortTypeTreeInfo', false);
			}
		}
		
		/*
		 * @return message nodes tree attributes info ! 
		 * @param operationName 
		 * @param opeChildNodeTag : imput or output | Help to get de correct message
		 */
		function getMessageTreeInfo(operationName, opeChildNodeTag){
			try {	
				var messageName = getName(getOpeMsgAttribValue(operationName, opeChildNodeTag), ':', null);
				var messageNode = getNodeByAttribute(wsdlDefNode, 'name', messageName);
				return getTree(messageNode,null,null);	
			} catch(e) {
				throw appMessage.allocateError(e, MODULE_TAG, 'getMessageTreeInfo', false);
			}
		}
		//END OF USED BY soapService---------------
		
		//USED BY directivesDataP:-----------------
		//TODO to generalize: consider a more complex analysis with xlmns values
		function isSimpleType(wsdlType){
			try {
				if(isType(wsdlType, 'xsd') || isWithoutPrefixe(wsdlType))
					return true;
				return false;	
			} catch(e) {
				throw appMessage.allocateError(e, MODULE_TAG, 'isSimpleType', false);
			}
		}
		
		/* 
		 * work with wsdlType and xmlType ! 
	     */
		function getComplexTypeTreeInfo(wsdlType,suffixValue){
			try {
				var complexTypeNode = getComplexTypeNode(getName(wsdlType, ':', suffixValue));
				return getTree(complexTypeNode,null,null);
			} catch(e) {
				throw appMessage.allocateError(e, MODULE_TAG, 'getComplexTypeTreeInfo', false);
			}
		}	
		
		/*
		 * TODO MUST BE GENERALIZE !!!
		 * 
		 * @return {'restrictValue': string , 'type': xsd simple type || complexTypeName , 
		 *          'isSimple': true || false};
		 * 
		 * don't call this method without check if complexType has one restriction node !
		 * it is assumed that only one restriction 
		 * and one attribute xmlNode inside a complexTypeNode xmlNode.
		 */
		function getRestrictAndTypeOfAttribute(complexTypeName){
			try {
				var complexTypeNode = getComplexTypeNode(complexTypeName);
				var restrictionsNode = complexTypeNode.getElementsByTagName("restriction");
				var attributesNode = restrictionNode.getElementsByTagName("attribute");
				if((restrictionsNode.length === 1) && (attributesNode.length === 1)){
					var restriction = getRestrictionValue(restrictionsNode);
					var typeOfAttrib = getTypeOfAttributeNode(attributesNode);
					return {'restrictValue': restriction, 'type': typeOfAttrib.type, 'isSimple': typeOfAttrib.isSimple};
				}else
					throw {'message': 'Unsupported No or more than one restriction-node/attribute-node !!!'};
			} catch(e) {
				throw appMessage.allocateError(e, MODULE_TAG, 'getRestrictAndTypeOfAttribute', false);
			}
		}
		//END OF USED BY directivesDataP---------------
		//END OF PUBLIC METHODS------------------------------------------------------------------

		//INTERFACE-----------------------------------------------------------------------
		return {
			//USED BY soapService:---------------
			initializeWsdl : function(newWsdl) {
				return initializeWsdl(newWsdl);
			},
			getPortTypeTreeInfo : function(childrenName,grandChildrenName) {
				return getPortTypeTreeInfo(childrenName,grandChildrenName);
			},
			getMessageTreeInfo : function(operationName, childNodeTag) {
				return getMessageTreeInfo(operationName, childNodeTag);
			},
			
			//USED BY directivesDataP:---------------
			isSimpleType : function(wsdlType) {
				return isSimpleType(wsdlType);
			},
			
			getComplexTypeTreeInfo : function(wsdlType, suffixValue) {
				return getComplexTypeTreeInfo(wsdlType, suffixValue);
			},
			
			getRestrictAndTypeOfAttribute: function(complexTypeName){
				return getRestrictAndTypeOfAttribute(complexTypeName);
			}
			
		};

	}];

});
