angular.module('soapMessage_m', [])
   .factory('soapMessage', ['$log', 'appMessage', 'wsdlDataP',
     function ($log, appMessage, wsdlDataP) {
       /*
        * For the soap pattern below see
        * http://www.ibm.com/developerworks/library/ws-whichwsdl/
        * http://www.w3schools.com/xml/xml_soap.asp
        */
       //TODO

       //PRIVATE VARIABLES----------------------------------------------------------
       var MODULE_TAG = 'soapMessage_m';


       //PRIVATE METHODS =>-----------------------------------------------------------------
       /*
        * 
        * @param {type} hInfo
        * @returns {soap rpc literal header}
        */
       function getSoapHeader(hInfo) {
         var part = "clientID";
         /*if(hInfo === null)
          return '';*/
         var result =
            '<SOAP-ENV:Header>'
            + '<' + part + '>'
            + '<from>angularClient</from>'
            + '<hostip>127.0.0.1/</hostip>'
            + '<lang>en</lang>'
            + '</' + part + '>'
            + '</SOAP-ENV:Header>';
         return result;
       }

       /*
        * 
        * @param {type} bInfo
        * @param {type} partsInfo
        * @returns {soap rpc encoded body}
        */
       function getSoapBody(msgPartsData, msgUserSubmit) {
         $log.debug('msgPartsData', msgPartsData);
         $log.debug('msgUserSubmit', msgUserSubmit);
         try {
           var soapParts = '';
           var msgParts = msgPartsData.parts;
           var userRspParts = msgUserSubmit.parts;
           for (var i = 0; i < msgParts.length; ++i) {
             
             var soapPart = '<' + msgParts[i].name + ' type=\"tns:' + msgParts[i].form.name + '\" >';
             //TODO check if not simple form , below only for not simple form:
             soapPart += '<' + msgParts[i].form.name + '>';//instead of  '<xsd:complexType name="ephemccRequest">'+ '<xsd:all>'
             
             var imputs = msgParts[i].form.imputs;//[]
             var userRsp = userRspParts[i].imputs;//{}
             var soapElements = '';
             
             soapElements += '<xsd:all>';
             for (var j = 0; j < imputs.length; ++j) {
               soapElements += '<' + imputs[j].name + ' xsi:type=\"xsd:' + imputs[j].xsdType + '\" >' + userRsp[imputs[j].name] + '</' + imputs[j].name + '>';
             }
             soapElements += '</xsd:all>';
             
             soapPart += soapElements;
             soapPart += '</' + msgParts[i].form.name + '>'
             soapPart += '</' + msgParts[i].name + '>';
             soapParts += soapPart;
             
             //soapParts += soapElements;
           }

           var result =
              '<SOAP-ENV:Body '
              + 'namespace="http://vo.imcce.fr/webservices/miriade" '
              + 'encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" >'
              + '<' + msgPartsData.operation + '>'
              + soapParts
              + '</' + msgPartsData.operation + '>'
              + '</SOAP-ENV:Body>'
           return result;
         } catch (e) {
           throw appMessage.allocateError(e, MODULE_TAG, 'getSoapBody', false);
         }
       }


       function getSoapChildrenElement() {

       }
       //END OF PRIVATE METHODS =>----------------------------------------------------------


       //PUBLIC METHODS =>------------------------------------------------------------------
       function getSoapMsg(msgPartsData, msgUserSubmit) {
         try {
           //var bindingInfo = wsdlDataP.getBindingInfo(operation);    
           var xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
           var soapHeader = getSoapHeader(null);//bindingInfo.header);
           var soapBody = getSoapBody(msgPartsData, msgUserSubmit);//bindingInfo.body, msgUserSubmit.parts);
           //xmlns def node +header + body :
           var soapEnvelope = '<SOAP-ENV:Envelope '
              + 'xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" '
              + 'xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" '
              + 'xmlns:xsd="http://www.w3.org/2001/XMLSchema" '
              + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
              + 'xmlns:tns="http://vo.imcce.fr/webservices/miriade" '
              + 'xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" '
              + 'xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" '
              + 'xmlns="http://schemas.xmlsoap.org/wsdl/" '
              + 'targetNamespace="http://vo.imcce.fr/webservices/miriade" >'
              + soapHeader
              + soapBody
              + '</SOAP-ENV:Envelope>';

           return xmlHeader + soapEnvelope;
         } catch (e) {
           throw appMessage.allocateError(e, MODULE_TAG, 'getSoapMsg', false);
         }
       }

       //END OF PUBLIC METHODS--------------------------------------------------------------

       //INTERFACE =>-----------------------------------------------------------------------
       return {
         getSoapMsg: function (msgPartsData, msgUserSubmit) {
           return getSoapMsg(msgPartsData, msgUserSubmit);
         },
       }

     }]);
/*function getSoapBody(bInfo,partsInfo) {
 var operation = "getAvailability";
 var part= "mime";
 var type= "xsd:string";
 var mime = "html";//votable html text/cvs
 var result =
 '<SOAP-ENV:Body ' 
 + 'namespace="http://vo.imcce.fr/webservices/miriade" '
 + 'encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" >' 
 + '<'+operation+'>'
 + '<'+part+' type='+type+' >'+mime+'</'+part+'>'
 + '</'+operation+'>'
 + '</SOAP-ENV:Body>'
 return result;
 }*/