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
         var result =
            '<SOAP-ENV:Header> '
            + '<' + hInfo.part + '> '
            + '<from>angularClient</from> '
            + '<hostip>127.0.0.1/</hostip> '
            + '<lang>en</lang> '
            + '</' + hInfo.part + '> '
            + '</SOAP-ENV:Header>';
         return result;
       }

       /*
        * 
        * @param {type} bInfo
        * @param {type} partsInfo
        * @returns {soap rpc encoded body}
        */
       function getSoapBody(bInfo,partsInfo) {
         var result =
            '<SOAP-ENV:Body ' 
            + 'xmlns:' + bInfo.namespace + ' ' 
            + 'xmlns:xsd="http://www.w3.org/2001/XMLSchema" '
            + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" > ' 
         
         
            + '<mime>xml</mime> ' + '</tns:' + soapMsgConfig.request + '> ' + '</SOAP-ENV:Body> '
         return result;
       }
       
       
       function getSoapChildrenElement(){
         
       }
       //END OF PRIVATE METHODS =>----------------------------------------------------------

       //PUBLIC METHODS =>------------------------------------------------------------------
       function getSoapMsg(msgUserSubmit) {
         try {
           var bindingInfo = wsdlDataP.getBindingInfo(operation);   
           
           var xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
           var soapHeader = getSoapHeader(bindingInfo.header);
           var soapBody = getSoapBody(bindingInfo.body, msgUserSubmit.parts);
           
           var soapEnvelope = '<SOAP-ENV:Envelope ' 
              + 'xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" ' 
              + 'xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" ' 
              + 'xmlns:tns=' + bindingInfo.tns + '> '
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
         getSoapMsg: function (msgUserSubmit) {
           return getSoapMsg(msgUserSubmit);
         },
       }

     }]);
