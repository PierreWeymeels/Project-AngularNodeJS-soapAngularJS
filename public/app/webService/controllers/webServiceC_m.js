"use strict";

angular.module('webServiceC_m', ['soapService_m'])
   .controller('webServiceC', ['soapService', '$log', '$scope', '$document',
     function (soapService, $log, $scope, $document) {
       var vm = this;
       //VIEW-MODEL VARIABLES:-------------------------------------------------
       vm.errorMsg = false;

       vm.initialized = false;
       vm.tableVisibility = false;
       vm.msgVisibility = false
       vm.answerVisibility = false;

       vm.fileName = null;

       vm.webServiceInfo = null;
       vm.msgRequestInfo = null;

       vm.msgUserSubmit = null;
       //END OF VIEW-MODEL VARIABLES:------------------------------------------

       //$SCOPE EVENTS---------------------------------------------------------
       $scope.$on('error', function (evt, msg) {
         evt.stopPropagation();
         vm.errorMsg = msg;
         launchDigest(true);
       });

       $scope.$on('fileLoaded', function (evt, file, fName) {
         evt.stopPropagation();
         vm.fileName = fName;
         var parser = new DOMParser();
         var xmlDom = parser.parseFromString(file, "text/xml");
         //$log.debug('file:   ', xmlDom);
         initializeOpeTable(xmlDom, true); //true= outside Angular because $emit called by reader event listener
       });

       $scope.$on('operationRequest', function (evt, operationName) {
         evt.stopPropagation();
         //TODO somethink
         operationRequest(operationName, false);//false= inside Angular because $emit called by angular scope method
       });

       $scope.$watch(function () {
         //$log.debug("cycle digest");
       });
       //END OF $SCOPE EVENTS--------------------------------------------------

       //VIEW-MODEL METHODS:---------------------------------------------------
       vm.ErrorDivClosing = function () {
         vm.errorMsg = false;
       }

       vm.tableAction = function (action) {
         switch (action) {
           case 'back':
             vm.tableVisibility = false;
             vm.initialized = false;

         }
       }

       vm.msgAction = function (action) {
         switch (action) {
           case 'submit':
             soapService.sentMsgToServer(vm.msgRequestInfo, vm.msgUserSubmit);
             break;
           case 'reset':
             //
             break;
           case 'back':
             vm.msgVisibility = false;
             vm.tableVisibility = true;
         }
       }
       //END OF VIEW-MODEL METHODS:----------------------------------------------

       //PRIVATES METHODS:-------------------------------------------------------
       function initializeOpeTable(wsdl, outsideAng) {
         var result = soapService.getWebService(wsdl);
         if (!result.error) {
           vm.webServiceInfo = result.data;
           vm.initialized = true;
           vm.tableVisibility = true;
         } else
           vm.errorMsg = result.data;
         launchDigest(outsideAng);
       }

       function operationRequest(operationName, outsideAng) {
         var result = soapService.getMsgRequestInfo(operationName);
         if (!result.error) {
           vm.msgRequestInfo = result.data;
           vm.msgUserSubmit = null;
           vm.tableVisibility = false;
           vm.msgVisibility = true;
         } else
           vm.errorMsg = result.data;
         launchDigest(outsideAng);
       }

       function launchDigest(outsideAng) {
         if (outsideAng)
           $scope.$digest();
       }
       
       function serverResp(result){
         if (!result.error) {    
           var target = $document[0].getElementsByTagName('div')[10];//.getElementById('serverRsp');
           target.innerHTML = result.data;
           //TODO push this into messageServer directive !
           vm.msgVisibility = false;
         }else
           vm.errorMsg = result.data;   
         vm.msgUserSubmit = null;
         //launchDigest(true);
       }
       //END OF PRIVATES METHODS:-------------------------------------------------
       
       //OBSERVER PATTERN =>
       soapService.addObserverCB(serverResp);
       //END OF PATTERN

       //FOR TEST =>
       vm.test = function(){
         soapService.sentMsgToServer(null,null); 
       }

     }]);
