angular.module('soapRequest_m', [])

   //CONFIG/////////////////////////////////////////////////////////////////////////
   .config(['soapRequestProvider', '$httpProvider',
     function (soapRequestProvider, $httpProvider) {
       delete $httpProvider.defaults.transformRequest;

     }])

   //RUN////////////////////////////////////////////////////////////////////////////
   .run(function () {

   })

   //PROVIDER///////////////////////////////////////////////////////////////////////
   .provider('soapRequest', function () {

     //soapRequestProvider data----------------------------------------------------------

     //soapRequest-----------------------------------------------------------------------
     this.$get = ['$log', 'appMessage', '$http', '$q',
       function ($log, appMessage, $http, $q) {
          //PRIVATE VARIABLES----------------------------------------------------------
         var MODULE_TAG = 'soapRequest';
         
         var namespace = 'http://vo.imcce.fr/webservices/miriade';
         var uriwsdl = namespace.concat('/miriade.wsdl');
         var nasaWsdl = 'http://cdaweb.gsfc.nasa.gov/WS/jaxrpc?WSDL';
         var miriadeXsl = 'http://vo.imcce.fr/webservices/miriade/miriade.xsl';

         function requestConfig(cache, method, url, soapMsg) {//cache: cache,
           var rqtConfig = {
             cache: cache,
             method: method,
             url: url,
             data: soapMsg,
             headers: {//'Accept' : "text/xml",  'Accept-Encoding' : 'chunked',
               'Content-Type': "text/plain;charset=\"utf-8\"",
             },
             //params: {WSDL: ""},
             //responseType: "",
             transformResponse: function (respData) {
               //$log.debug('response:   ', respData);
               var parser = new DOMParser();
               respData = parser.parseFromString(respData, "text/xml");
               //$log.debug('responseXml:   ', respData);
               //var t = respData.responseXML
               //document xml
               return respData;
             }
           };
           return rqtConfig;
         }

         function getServerAnswer(soapMsg) {
           try {
             var soapAction = 'http://vo.imcce.fr/webservices/miriade/getAvailability';
             var xsl = $http(requestConfig(true, 'get', miriadeXsl, null));
             var xml = $http(requestConfig(false, 'POST', soapAction, soapMsg));
             //$q.all([xsl, xml]).then(function(results) { 
               //var xsltProcessor = new XSLTProcessor();
               //xsltProcessor.importStylesheet(results[0].data);
                
           
               //var resultDoc = xsltProcessor.transformToDocument(results[1].data);
               //$log.debug('resultDoc:   ', resultDoc);
               return $q.all([xsl, xml]);//results;//resultDoc;  
           } catch (e) {
             throw appMessage.allocateError(e, MODULE_TAG, 'getServerAnswer', false);
           }
         }


         //INTERFACE-----------------------------------------------------------------------
         return {
           loadWsdl: function () {
             return $http(requestConfig('get', uriwsdl, null));
           },
           getServerAnswer: function (soapMsg) {
             return getServerAnswer(soapMsg);
           },
         };

       }];

   });

