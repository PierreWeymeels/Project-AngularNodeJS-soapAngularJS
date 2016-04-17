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
		//USED BY soapService:---------------
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
			    var result = new treeLib.Tree(getNodeData(portTypeNode));  
			    addChildTree(result._root,portTypeNode,childrenName,grandChildrenName);
				return result._root;
			} catch(e) {
				throw appMessage.allocateError(e, MODULE_TAG, 'getPortTypeTreeInfo', false);
			}
		}
		
		/*
		 * @return message nodes tree attributes info ! 
		 * @param operationName 
		 * @param childOpeNodeTag : imput or output | Help to get de correct message
		 */
		function getMessageTreeInfo(operationName, childOpeNodeTag){
			try {	
				var messageName = getName(getOpeMsgAttribValue(operationName, childOpeNodeTag), ':', null);
				var messageNode = getNodeByAttribute(wsdlDefNode, 'name', messageName);
				var result = new treeLib.Tree(getNodeData(messageNode)); 
				addChildTree(result._root,messageNode,null);		
				return result._root;
			} catch(e) {
				throw appMessage.allocateError(e, MODULE_TAG, 'getMessageTreeInfo', false);
			}
		}
		//END OF USED BY soapService---------------
		
		//USED BY directivesDataP:---------------
		function isSimpleType(type){
			try {
				
			} catch(e) {
				throw appMessage.allocateError(e, MODULE_TAG, 'isSimpleType', false);
			}
		}
		
		function getComplexTypeTreeInfo(name){
			try {
				
			} catch(e) {
				throw appMessage.allocateError(e, MODULE_TAG, 'getComplexTypeTreeInfo', false);
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
			}
			
			//USED BY directivesDataP:---------------
			isSimpleType : function(type) {
				return isSimpleType(type);
			}
			
			getComplexTypeTreeInfo : function(name) {
				return getComplexTypeTreeInfo(name);
			}
		};

	}];

});
