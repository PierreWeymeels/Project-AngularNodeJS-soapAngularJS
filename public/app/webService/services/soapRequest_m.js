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

     //wsdlDataP-----------------------------------------------------------------------
     this.$get = ['$log', 'appMessage', '$http',
       function ($log, appMessage, $http) {

         var namespace = 'http://vo.imcce.fr/webservices/miriade';
         var uriwsdl = namespace.concat('/miriade.wsdl');
         var nasaWsdl = 'http://cdaweb.gsfc.nasa.gov/WS/jaxrpc?WSDL';


         function requestConfig(method, url, soapMsg) {
           var rqtConfig = {
             method: method,
             url: url,
             data: soapMsg,
             headers: {//'Accept' : "text/xml",  'Accept-Encoding' : 'chunked',
               'Content-Type': "text/plain;charset=\"utf-8\"",
             },
             //params: {WSDL: ""},
             //responseType: "",
             transformResponse: function (respData) {
               var parser = new DOMParser();
               respData = parser.parseFromString(respData, "text/xml");
               $log.debug('response:   ', respData);
               //var t = respData.responseXML
               //document xml
               return respData;
             }
           };
           return rqtConfig;
         }

         //INTERFACE-----------------------------------------------------------------------
         return {
           loadWsdl: function () {
             return $http(requestConfig('get', uriwsdl, null));
           },
           getServerAnswer: function (soapMsg) {
             return $http(requestConfig('POST',
                'http://vo.imcce.fr/webservices/miriade/getAvailability', soapMsg));
           },
         };

       }];

   });

