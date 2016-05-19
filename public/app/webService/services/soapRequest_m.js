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
         
         
         
         var soapMsgEphemc = 
          '<?xml version="1.0" encoding="UTF-8"?>'
          +'<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" '
          +'xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" '
          +'xmlns:xsd="http://www.w3.org/2001/XMLSchema" '
          +'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
          +'xmlns:tns="http://vo.imcce.fr/webservices/miriade" '
          +'xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" ' 
          +'xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" '
          +'xmlns="http://schemas.xmlsoap.org/wsdl/" '
          +'targetNamespace="http://vo.imcce.fr/webservices/miriade" >'
          +'<SOAP-ENV:Header>'
          +'<clientID>'
          +'<from>angularClient</from>'
          +'<hostip>127.0.0.1/</hostip>'
          +'<lang>en</lang>'
          +'</clientID>'
          +'</SOAP-ENV:Header>'
          +'<SOAP-ENV:Body namespace="http://vo.imcce.fr/webservices/miriade" '
          +'encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" >'
          //+'<ephemcc>'
          //+'<input type="ephemccRequest" >'
          +'<ephemccRequest>'
          //+'<xsd:complexType name="ephemccRequest">'namespace
          //+'<xsd:all>'
          +'<name type="xsd:string" >p:Mars</name>'
          +'<type type="xsd:string" >planet</type>'
          +'<epoch type="xsd:string" >1977-04-22T01:00:00-05:00</epoch>'
          +'<nbd type="xsd:int" >1</nbd>'
          +'<step type="xsd:string" >1d</step>'
          +'<tscale type="xsd:string" >UTC</tscale>'
          +'<observer type="xsd:string" >500</observer>'
          +'<theory type="xsd:string" >INPOP</theory>'
          +'<teph type="xsd:int" >1</teph>'
          +'<tcoor type="xsd:int" >1</tcoor>'
          +'<rplane type="xsd:int" >1</rplane>'
          +'<mime type="xsd:string" >votable</mime>'
          +'<output type="xsd:string" ></output>'
          +'<extrap type="xsd:int" >0</extrap>'
          +'<get type="xsd:string" >orbital_params</get>'
          //+'</xsd:all>'
          //+'</xsd:complexType>'
          +'</ephemccRequest>'
          //+'</input>'
          //+'</ephemcc>'
          +'</SOAP-ENV:Body>'
          +'</SOAP-ENV:Envelope>';
        

         function requestConfig(cache, method, url, soapMsg, contentType) {//cache: cache,
           var rqtConfig = {
             cache: cache,
             method: method,
             url: url,
             data: soapMsg,
             headers: {//'Accept' : "text/xml",  'Accept-Encoding' : 'chunked',plain application/xml
               'Content-Type': contentType,
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
             $log.debug('SOAPMSGTEST : ',soapMsgEphemc);
             var soapAction = 'http://vo.imcce.fr/webservices/miriade/ephemcc';//getAvailability ephemcc
             var xsl = $http(requestConfig(true, 'get', miriadeXsl, null,"text/plain;charset=\"utf-8\""));
             var xml = $http(requestConfig(false, 'post', soapAction, soapMsgEphemc,"text/plain;charset=\"utf-8\"")); 
             return $q.all([xsl, xml]);
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

