angular.module('wsdlDataP_m', [])

//CONFIG/////////////////////////////////////////////////////////////////////////
   .config(['wsdlDataPProvider',
     function (soapWsdlProvider) {
       //TODO set this synchronous:
       require(['../app/webService/services/libs/treeLib'], //['wslibs/treeLib'],
          function (treeLib) {
            soapWsdlProvider.treeLib = treeLib;
          }, function (err) {
         soapWsdlProvider.treeLib = err.message;
       });
     }])

//RUN////////////////////////////////////////////////////////////////////////////
   .run(function () {

   })

//PROVIDER///////////////////////////////////////////////////////////////////////
   .provider('wsdlDataP', function () {

     //wsdlDataPProvider data----------------------------------------------------------
     this.treeLib = null;

     //wsdlDataP-----------------------------------------------------------------------
     this.$get = ['$log', 'appMessage',
       function ($log, appMessage) {
         //PRIVATE VARIABLES----------------------------------------------------------
         var MODULE_TAG = 'wsdlDataP_m';
         var treeLib = this.treeLib;

         var wsdlDefNode = null;

         //PRIVATE METHODS------------------------------------------------------------
         function getSoapBindingValue(attribute) {
           var bindingNode = wsdlDefNode.getElementsByTagName("binding")[0];
           var soapBindingNode = bindingNode.getElementsByTagName("binding")[0];
           return soapBindingNode.getAttribute(attribute);
         }

         function getXmlnsCollection(node, defaultNs) {
           try {
             var attributes = node.attributes;
             var result = [];
             for (var i = 0; i < attributes.length; ++i) {
               var attr = attributes[i];
               if ((defaultNs) ? (attr.name.localeCompare('xmlns') === 0) :
                  (attr.name.indexOf("xmlns") === 0))
                 result[i] = new XmlnsInfo(attr.name, attr.value);
             }
             return result;
           } catch (e) {
             throw appMessage.allocateError(e, MODULE_TAG, 'getXmlnsCollection', false);
           }
         }

         function getDefaultXmlns(node) {
           var nodeDefaultXmlns = getXmlnsCollection(node, true);
           if (nodeDefaultXmlns.length === 0) {
             return getXmlnsCollection(wsdlDefNode, true);
           }
           return nodeDefaultXmlns;
         }

         function getNodeData(node) {
           var result = new NodeData(node.nodeName, getAttributesInfo(node));
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

         function getText(node) {
           var cN = node.firstChild;
           if ((cN !== null) && (cN.nodeType === 3))
             return cN.nodeValue;
           return null;
         }

         function getTree(parentXmlNode, childrenName, grandChildrenName) {
           try {
             var result = new treeLib.Tree(getNodeData(parentXmlNode));
             addChildTree(result._root, parentXmlNode, childrenName, grandChildrenName);
             return result;
           } catch (e) {
             throw appMessage.allocateError(e, MODULE_TAG, 'getTree', false);
           }
         }

         function addChildTree(parentTreeNode, parentXmlNode, childrenName, grandChildrenName) {
           try {
             var childrenXmlNode;
             if (childrenName !== null)
               childrenXmlNode = parentXmlNode.getElementsByTagName(childrenName);
             else
               childrenXmlNode = parentXmlNode.children;
             for (var i = 0; i < childrenXmlNode.length; ++i) {
               parentTreeNode.addChild(getNodeData(childrenXmlNode[i]));
               if (childrenXmlNode[i].children.length !== 0) {
                 addChildTree(parentTreeNode.children[i], childrenXmlNode[i], grandChildrenName, null)
               }
             }
           } catch (e) {
             throw appMessage.allocateError(e, MODULE_TAG, 'addChildTree', false);
           }
         }

         /* 
          * work with wsdlType and xmlType ! 
          */
         function getName(value, prefixSeparator, suffixValue) {
           try {
             var name = value;
             if (prefixSeparator !== null) {
               name = name.split(prefixSeparator);
               name = name[name.length - 1];
             }
             if (suffixValue !== undefined) {
               var suffixL = suffixValue.length;
               var nameL = name.length;
               name = name.substring(0, nameL - suffixL);
             }
             return name;
           } catch (e) {
             throw appMessage.allocateError(e, MODULE_TAG, 'getName', false);
           }
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
           try {
             var result;
             var schemaNodes = wsdlDefNode.getElementsByTagName("schema");
             for (var i = 0; i < schemaNodes.length; ++i) {
               result = getNodeByAttribute(schemaNodes[i], 'name', nameValue);
               if (result !== null)
                 return result;
             }
             throw {'message': 'complexTypeNode: ' + nameValue + ' = null'};
           } catch (e) {
             throw appMessage.allocateError(e, MODULE_TAG, 'getComplexTypeNode', false);
           }
         }

         //TODO with xmlns analysis !!!
         function getRestrictionValue(restrictionNode) {
           try {
             var base = getNodeAttributeValue(restrictionNode, 'base');
             var restriction = getName(base, ':');//, null);
             return restriction;
           } catch (e) {
             throw appMessage.allocateError(e, MODULE_TAG, 'getRestrictionValue', false);
           }

         }

         /*
          * @return {'type': xsd type (string) || complexTypeName, 'isSimple': boolean} 
          * 
          * TODO generalize this with xmlns analysis !!!
          */
         function getTypeOfAttributeNode(attributesNode, restrictionValue) {
           try {
             if (restrictionValue.localeCompare('Array') === 0)
               var suffix = '[]';
             else
               throw  {'message': 'Unsupported restrictionValue !'};
             var ref = getNodeAttributeValue(attributesNode, 'ref');
             var name = 'wsdl:' + getSuffix(ref, ':');
             var wsdlType = getNodeAttributeValue(attributesNode, name);
             return {'isSimple': isSimpleType(wsdlType), 'type': getName(wsdlType, ':', suffix)};
           } catch (e) {
             throw appMessage.allocateError(e, MODULE_TAG, 'getTypeOfAttributeNode', false);
           }
         }

         function getNodeAttributeValue(node, name) {
           try {
             var attribute = node.getAttributeNode(name);
             return attribute.value;
           } catch (e) {
             throw appMessage.allocateError(e, MODULE_TAG, 'getNodeAttributeValue', false);
           }
         }

         function getPrefix(name, prefixSeparator) {
           var result = name.split(prefixSeparator);
           return result[0];
         }

         function getSuffix(name, prefixSeparator) {
           var result = name.split(prefixSeparator);
           return result[result.length - 1];
         }
         //END OF PRIVATE METHODS-------------------------------------------------------------

         //CLASSES ---------------------------------------------------------------------------
         function XmlnsInfo(prefix, url) {
           var that = this;
           that.prefix = prefix;
           that.url = url;
         }

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
             wsdlDefNode = newWsdl.documentElement;
             var style = getSoapBindingValue('style');
             var transport = getSoapBindingValue('transport');
             if ((style.localeCompare("rpc") === 0) && (transport.localeCompare("http://schemas.xmlsoap.org/soap/http") === 0)) {
               return true;
             } else {
               wsdlDefNode = null;
               throw new appMessage.UserMsg('Not supported', 'Only rpc style and http transport supported !');
             }
           } catch (e) {
             wsdlDefNode = null;
             throw appMessage.allocateError(e, MODULE_TAG, 'initializeWsdl', false);
           }
         }

         /*
          * @return
          * portType nodes tree attributes info !
          */
         function getPortTypeTreeInfo(childrenName, grandChildrenName) {
           try {
             var portTypeNode = wsdlDefNode.getElementsByTagName("portType")[0];
             return getTree(portTypeNode, childrenName, grandChildrenName);
           } catch (e) {
             throw appMessage.allocateError(e, MODULE_TAG, 'getPortTypeTreeInfo', false);
           }
         }

         /*
          * @return message nodes tree attributes info ! 
          * @param operationName 
          * @param opeChildNodeTag : imput or output | Help to get de correct message
          */
         function getMessageTreeInfo(operationName, opeChildNodeTag) {
           try {
             var messageName = getName(getOpeMsgAttribValue(operationName, opeChildNodeTag), ':')//, null);
             var messageNode = getNodeByAttribute(wsdlDefNode, 'name', messageName);
             return getTree(messageNode, null, null);
           } catch (e) {
             throw appMessage.allocateError(e, MODULE_TAG, 'getMessageTreeInfo', false);
           }
         }
         //END OF USED BY soapService---------------

         //USED BY directivesDataP:-----------------
         //TODO to generalize: consider a more complex analysis with xlmns values
         function isSimpleType(wsdlType) {
           try {
             if (isType(wsdlType, 'xsd') || isWithoutPrefixe(wsdlType))
               return true;
             return false;
           } catch (e) {
             throw appMessage.allocateError(e, MODULE_TAG, 'isSimpleType', false);
           }
         }

         /* 
          * work with wsdlType and xmlType ! 
          * @return tree
          */
         function getComplexTypeTreeInfo(wsdlType, suffixValue) {
           try {
             var result = getComplexTypeNode(getName(wsdlType, ':', suffixValue));
             return  getTree(result, null, null);
           } catch (e) {
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
         function getRestrictAndTypeOfAttribute(complexTypeName) {
           try {
             var complexTypeNode = getComplexTypeNode(complexTypeName);
             var restrictionsNode = complexTypeNode.getElementsByTagName("restriction");
             var attributesNode = restrictionsNode[0].getElementsByTagName("attribute");
             if (attributesNode.length === 1) {
               var restriction = getRestrictionValue(restrictionsNode[0]);
               var typeOfAttrib = getTypeOfAttributeNode(attributesNode[0], restriction);
               return {'restrictValue': restriction, 'type': typeOfAttrib.type, 'isSimple': typeOfAttrib.isSimple};
             } else
               throw {'message': 'Unsupported No or more than one restriction-node/attribute-node !!!'};
           } catch (e) {
             throw appMessage.allocateError(e, MODULE_TAG, 'getRestrictAndTypeOfAttribute', false);
           }
         }
         //END OF USED BY directivesDataP---------------
         //END OF PUBLIC METHODS------------------------------------------------------------------

         //INTERFACE-----------------------------------------------------------------------
         return {
           //USED BY soapService:---------------
           initializeWsdl: function (newWsdl) {
             return initializeWsdl(newWsdl);
           },
           getPortTypeTreeInfo: function (childrenName, grandChildrenName) {
             return getPortTypeTreeInfo(childrenName, grandChildrenName);
           },
           getMessageTreeInfo: function (operationName, childNodeTag) {
             return getMessageTreeInfo(operationName, childNodeTag);
           },
           //USED BY directivesDataP:---------------
           isSimpleType: function (wsdlType) {
             return isSimpleType(wsdlType);
           },
           getComplexTypeTreeInfo: function (wsdlType, suffixValue) {
             return getComplexTypeTreeInfo(wsdlType, suffixValue);
           },
           getRestrictAndTypeOfAttribute: function (complexTypeName) {
             return getRestrictAndTypeOfAttribute(complexTypeName);
           }

         };

       }];

   });
