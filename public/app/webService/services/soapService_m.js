angular.module('soapService_m', ['directivesDataP_m', 'soapRequest_m', 'wsdlDataP_m', 'soapMessage_m'])
   .factory('soapService', ['$log', 'appMessage', 'directivesDataP', 'soapRequest', 'wsdlDataP', 'soapMessage',
     function ($log, appMessage, directivesDataP, soapRequest, wsdlDataP, soapMessage) {
       //PRIVATE VARIABLES----------------------------------------------------------
       var MODULE_TAG = 'soapService_m';

       //PRIVATE METHODS------------------------------------------------------------
       function getHtml(xsl,xml){
          var xsltProcessor = new XSLTProcessor();
          xsltProcessor.importStylesheet(xsl);
          var resultDoc = xsltProcessor.transformToDocument(xml);
          return resultDoc.documentElement.innerHTML;  
       }
       //PUBLIC METHODS---------------------------------------------------------------
       function getWebService(wsdl) {
         try {
           if (wsdlDataP.initializeWsdl(wsdl)) {
             var wsdlPortTypeTree = wsdlDataP.getPortTypeTreeInfo('operation', 'documentation');
             return {
               'error': false,
               'data': directivesDataP.getOpeTableData(wsdlPortTypeTree)
             };
           }
         } catch (e) {
           return {
             'error': true,
             'data': appMessage.allocateError(e, MODULE_TAG, 'getWebService', true)
           };
         }
       }

       function getMsgRequestInfo(operationName) {
         try {
           var wsdlMsgTree = wsdlDataP.getMessageTreeInfo(operationName, 'input');
           return {
             'error': false,
             'data': directivesDataP.getMsgPartsData(operationName, wsdlMsgTree)
           };
         } catch (e) {
           return {
             'error': true,
             'data': appMessage.allocateError(e, MODULE_TAG, 'getMsgRequestInfo', true)
           };
         }
       }

       function sentMsgToServer(msgPartsData, msgUserSubmit) {
         try {
           //var soapMsg = soapMessage.getSoapMsg(msgPartsData, msgUserSubmit);
           //$log.debug('SOAPMSG : ',soapMsg);
           var rsp = soapRequest.getServerAnswer(null);//soapMsg
           rsp.then(function (result) {
             notify({'error': false, 'data': getHtml(result[0].data,result[1].data)});
           }, function (e) {
             throw e;
           });
         } catch (e) {
           notify({
             'error': true,
             'data': appMessage.allocateError(e, MODULE_TAG, 'getServerAnswer', true)
           });
         }
       }

       //END OF PUBLIC METHODS-----------------------------------------------------------
       
       //OBSERVABLE PATTERN =>
       var observerCBs = [];
       //register an observer
       function addObserverCB(callback) {
         observerCBs.push(callback);
       };
       //call this when you want
       function notify(info) {
         angular.forEach(observerCBs, function (callback) {
           callback(info);
         });
       };
       //END OF PATTERN

       //INTERFACE-----------------------------------------------------------------------
       /*
        * @return {error:boolean,data:...}
        */
       return {
         //OBSERVABLE PATTERN :
         addObserverCB: function(callback){
           addObserverCB(callback);
         },
         getWebService: function (wsdl) {
           return getWebService(wsdl);
         },
         getMsgRequestInfo: function (operationName) {
           return getMsgRequestInfo(operationName);
         },
         sentMsgToServer: function (msgPartsData, msgUserSubmit) {
           sentMsgToServer(msgPartsData, msgUserSubmit);
         },
       };

     }]);

