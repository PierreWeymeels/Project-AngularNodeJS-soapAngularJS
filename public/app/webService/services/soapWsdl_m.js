angular.module('soapWsdl_m', ['appMessage_m'])
.constant('MODULE_TAG', 'soapWsdl_m')
.factory('soapWsdl', ['MODULE_TAG', '$log', 'appMessage',
function(MODULE_TAG, $log, appMessage) {
	//PRIVATE VARIABLES------------------------------------------------------------------
	var wsdlDefNode = null;

	//PRIVATE METHODS------------------------------------------------------------------
	function getSoapBindingValue(attribute) {
		var bindingNode = wsdlDefNode.getElementsByTagName("binding")[0];
		var soapBindingNode = bindingNode.getElementsByTagName("binding")[0];
		return soapBindingNode.getAttribute(attribute);
	}

	function getDocumentation(targetNode) {
		var documentationNode = targetNode.getElementsByTagName('documentation')[0];
		if (documentationNode !== undefined)
			return documentationNode.childNodes[0].nodeValue;
		return 'undocumented';
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

	function getPartsNodeInfo(messageNode) {
		var result = [];
		var partsNode = messageNode.getElementsByTagName('part');
		for (var i = 0; i < partsNode.length; ++i) {
			result[i] = getPartNodeInfo(partsNode[i]);
		}
		return result;
	}

	function getPartNodeInfo(partNode) {
		var result = new PartNodeInfo();
		result.name = partNode.getAttribute("name");
		var typeValue = partNode.getAttribute("type");
		//TODO with || without ':' !!!=>only if xsdUrl is not xmlns default ns !!!
		if (isType(typeValue, 'xsd')) {
			result.type = typeValue;
			//TODO .element ,... cf. miriade header
		} else {
			var complexTypeNode = getComplexTypeNode(getName(typeValue, ':', null));
			result.complexType = getComplexTypeInfo(complexTypeNode);
		}
		return result;
	}

	//TODO select by specific shema :
	function getComplexTypeNode(nameValue) {
		var schemaNodes = wsdlDefNode.getElementsByTagName("schema");
		var result;
		for (var i = 0; i < schemaNodes.length; ++i) {
			result = getNodeByAttribute(schemaNodes[i], 'name', nameValue);
			if (result !== null)
				return result;
		}
		throw new appMessage.ExceptionMsg(MODULE_TAG, 'getComplexTypeNode', 'complexTypeNode: ' + nameValue + ' = null');
	}

	function getComplexTypeNodeInfo(complexTypeNode) {
		var result = new ComplexTypeNodeInfo();
		result.name = complexTypeNode.getAttribute("name");
		//TEST WITH ATTRIBUTE NODE:
		var attributesNode = complexTypeNode.getElementsByTagName('attribute');
		if (attributesNode.length != 0) {
			result.attributes = [];
			for (var i = 0; i < attributesNode.length; ++i) {
				result.attributes[i] = getAttributeNodeInfo(attributesNode[i]);
			}
		} else {//NO  ATTRIBUTE NODE    => //complexTypeNode own element node //TODO  generalize this !!!
			var elementsNode = complexTypeNode.getElementsByTagName('element');
			if (elementsNode.length != 0) {
				result.elements = [];
				for (var i = 0; i < elementsNode.length; ++i) {
					result.elements[i] = getElementNodeInfo(elementsNode[i]);
				}
			}
		}
		return result;
	}

	function getAttributeNodeInfo(attributeNode) {
		var result = new AttributeNodeInfo();
		var arrayTypeValue = attributeNode.getAttribute("wsdl:arrayType");
		result.arrayType = arrayTypeValue;
		if (isType(arrayTypeValue, 'tns')) {
			var complexTypeNode = getComplexTypeNode(getName(arrayTypeValue, ':', '[]'));
			result.complexType = getComplexTypeInfo(complexTypeNode);
		} else {
			result.type = getName(arrayTypeValue, ':', '[]');
			//':' instead of null to generalize for eg: xsd:...
		}
		return result;
	}

	function getElementNodeInfo(elementNode) {
		var result = new ElementNodeInfo();
		var typeValue = elementNode.getAttribute("type");
		var typeComplex = isType(typeValue, 'tns');
		//TODO generalize that !
		if (typeComplex) {
			var complexTypeNode = getComplexTypeNode(getName(typeValue, ':', null));
			result.complexType = getComplexTypeNodeInfo(complexTypeNode);
		}
		var attributes = elementNode.attributes;
		for (var i = 0; i < attributes.length; ++i) {
			if (!typeComplex || !(attributes[i].name.localeCompare("type") === 0))
				result[attributes[i].name] = attributes[i].value;
		}
		return result;
	}

	//For attributes info-----------------------------------------------------------------
	function getXmlnsCollection(node) {
		var attributes = node.attributes;
		var result = [];
		for (var i = 0; i < attributes.length; ++i) {
			var attr = attributes[i];
			if (attr.name.indexOf("xmlns") === 0)
				result[i] = new XmlnsInfo(attr.name, attr.value);
		}
		return result;
	}

	function getAttributesInfo(node) {
		var attributes = node.attributes;
		var result = [];
		for (var i = 0; i < attributes.length; ++i) {
			result[i] = new AttributeInfo(attributes[i].name, attributes[i].value);
		}
		if (node.nodeName.localeCompare("schema") === 0) {
			var imports = node.getElementsByTagName("import");
			for (var i = 0; i < imports.length; ++i) {
				result.push(new AttributeInfo(imports[i].name, imports[i].value));
			}
		}
		return result;
	}

	function getAttributeInfo(node, name) {
		var attribute = node.getAttributeNode(name);
		if (documentationNode !== undefined)
			return new AttributeInfo(attribute.name, attribute.value)
		return null;
	}

	//others private methods-----------------------------------------------
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

	function isType(typeValue, prefixe) {
		return (typeValue.split(':')[0] == prefixe)
	}

	//END OF PRIVATE METHODS-------------------------------------------------------------

	//CLASSES ---------------------------------------------------------------------------
	/*
	 * eg: xmlns:xsd="http://..." <=> prefix="xsd", url="http://..."
	 */
	function XmlnsInfo(prefix, url) {
		var that = this;
		that.prefix = prefix;
		that.url = url;
	}

	function AttributeInfo(name, value) {
		var that = this;
		that.name = name;
		that.value = value;
	}

	function OperationNodeInfo() {
		var that = this;
		that.name = null;
		that.documentation = null;
	}

	function MessageNodeInfo() {
		var that = this;
		that.name = null;
		that.documentation = null;
		that.parts = null;
	}

	function PartNodeInfo() {
		var that = this;
		that.name = null;
		that.type = null;
		that.complexType = null;
	}

	function ComplexTypeNodeInfo() {
		var that = this;
		that.name = null;
		that.attributes = null;
		that.elements = null;
	}

	function AttributeNodeInfo() {
		var that = this;
		that.arrayType = null;
		that.type = null;
		that.complexType = null;
	}

	function ElementNodeInfo() {
		var that = this;
		that.type = null;
		that.complexType = null;
		/*
		 that.name = null;
		 that.default = null;
		 that.minOccurs = null;
		 that.maxOccurs = null;*/
	}

	//CLASSES ------------------------------------------------------------------------

	//PUBLIC METHODS------------------------------------------------------------------
	function initializeWsdl(newWsdl) {
		try {
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
			if (!( e instanceof appMessage.ExceptionMsg) || !( e instanceof appMessage.UserMsg))
				throw new appMessage.ExceptionMsg(MODULE_TAG, 'setWsdl', e.message);
			throw e;
		}
	}

	/*
	 * @return
	 * operations[
	 * {
	 * 	name
	 *  documentation
	 * }
	 * |
	 * ]
	 */
	function getOperationsInfo() {
		try {
			var portTypeNode = wsdlDefNode.getElementsByTagName("portType")[0];
			var operationNodes = portTypeNode.getElementsByTagName("operation");
			var result = [];
			for (var i = 0; i < operationNodes.length; ++i) {
				result[i] = new OperationNodeInfo();
				result[i].name = operationNodes[i].getAttribute("name");
				result[i].documentation = getDocumentation(operationNodes[i]);
			}
			return result;
		} catch(e) {
			if (!( e instanceof appMessage.ExceptionMsg) || !( e instanceof appMessage.UserMsg))
				throw new appMessage.ExceptionMsg(MODULE_TAG, 'getOperationsInfo', e.message);
			throw e;
		}
	}

	/*
	 * @return
	 * message =
	 * {
	 *  documentation
	 * 	parts = part[]
	 * }
	 */
	function getMessageNodeInfo(operationName, childNodeTag) {
		try {
			var result = new MessageNodeInfo();
			var messageName = getName(getOpeMsgAttribValue(operationName, childNodeTag), ':', null);
			var messageNode = getNodeByAttribute(wsdlDefNode, 'name', messageName);
			result.name = messageNode.getAttribute("name");
			result.documentation = getDocumentation(messageNode);
			result.parts = getPartsNodeInfo(messageNode);
			return result;
		} catch(e) {
			if (!( e instanceof appMessage.ExceptionMsg) || !( e instanceof appMessage.UserMsg))
				throw new appMessage.ExceptionMsg(MODULE_TAG, 'getMessageNodeInfo', e.message);
			throw e;
		}
	}

	//END OF PUBLIC METHODS------------------------------------------------------------------

	//INTERFACE-----------------------------------------------------------------------
	return {
		initializeWsdl : function(newWsdl) {
			return initializeWsdl(newWsdl);
		},
		getOperationsInfo : function() {
			return getOperationsInfo();
		},
		getMessageNodeInfo : function(operationName, childNodeTag) {
			return getMessageNodeInfo(operationName, childNodeTag);
		}
	};

}]);
