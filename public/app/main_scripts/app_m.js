"use strict";
angular.module('app_m', 
	['ngAnimate', 'ngMessages', 'appRoutes_m', 
	 'appMessage_m','fileDialog_m','operationsTable_m', 
	 'accordion_m', 'messageParts_m', 'messageForm_m', 
	 'homeC_m', 'webServiceC_m'
	])
.config(['$httpProvider','$logProvider',function($httpProvider, $logProvider) {
	console.log('app.config');
	$logProvider.debugEnabled(true);
}])
.run(['$log',function($log) {
	$log.debug('app.run');

}]);
