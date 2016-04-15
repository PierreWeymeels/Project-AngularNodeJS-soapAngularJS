"use strict";

angular.module('webServiceC_m', ['soapService_m']).controller('webServiceC', ['soapService', '$log', '$scope',
function(soapService, $log, $scope) {
	var vm = this;
	//VIEW-MODEL VARIABLES:-------------------------------------------------
	vm.errorMsg = false;
	
	vm.initialized = false;
	vm.tableVisibility = false;
	vm.formsVisibility = false;
	
	vm.fileName = null;

	vm.wsdlWsInfo = null;
	vm.requestInfo = null;
	
	vm.respForm = null;
	//END OF VIEW-MODEL VARIABLES:------------------------------------------
	
	//$SCOPE EVENTS---------------------------------------------------------
	$scope.$on('error', function(evt, msg) {
		evt.stopPropagation();
		vm.errorMsg = msg;
		launchDigest(true);	
	});
	
	$scope.$on('fileLoaded', function(evt, file,fName) {
		evt.stopPropagation();
		vm.fileName = fName;
		var parser = new DOMParser();
		var xmlDom = parser.parseFromString(file, "text/xml");
		//$log.debug('file:   ', xmlDom);
		initializeOpeTable(xmlDom,true); 
	});
	
	$scope.$on('operationRequest', function(evt,operationName) {
		evt.stopPropagation();
		//TODO somethink
		operationRequest(operationName,true);
	});
	
	$scope.$watch(function() {
		//$log.debug("cycle digest");
	});
	//END OF $SCOPE EVENTS--------------------------------------------------

	//VIEW-MODEL METHODS:---------------------------------------------------
	vm.ErrorDivClosing = function(){
		vm.errorMsg = false;
	}
	
	vm.tableAction = function(action) {
		switch(action) {
		case 'back':
			vm.tableVisibility = false;
			vm.initialized = false;
			
		}
	}
	
	vm.formAction = function(action) {
		switch(action) {
		case 'submit':
			//formSubmit();
			break;
		case 'reset':
			//vm.respForm = miriadeFormMS.getFormDefaultResp();
			break;
		case 'back':
			vm.formsVisibility = false;
			vm.tableVisibility = true;
		}
	}
	//END OF VIEW-MODEL METHODS:----------------------------------------------
	
	//PRIVATES METHODS:-------------------------------------------------------
	function initializeOpeTable(wsdl,outsideAng) {
		var result = soapService.getWebService(wsdl);
		if (!result.error) {
			vm.wsdlWsInfo = result.data;
			vm.initialized = true;
			vm.tableVisibility = true;	
		}else 
			vm.errorMsg = result.data;
		launchDigest(outsideAng);	
	}
	
	function operationRequest(operationName,outsideAng) {
		var result = soapService.getRequestInfo(operationName);
		if (!result.error) {
			vm.requestInfo = result.data;
			vm.tableVisibility = false;
			vm.formsVisibility = true;
		}else
			vm.errorMsg = result.data;
		launchDigest(outsideAng);
	}	
	
	function launchDigest(outsideAng){
		if(outsideAng)
			$scope.$digest();
	}
	//END OF PRIVATES METHODS:-------------------------------------------------

}]);
