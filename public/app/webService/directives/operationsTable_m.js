angular.module('operationsTable_m', [])
.directive("operationsTable", ['$log','$compile',
function($log,$compile) {
	var MODULE_TAG = 'operationsTable_m';
	return {
		restrict : "E",
		priority : 0,
		terminal : false,
		scope : {
			webServiceInfo: "=info",
			back: "&",
		},
		templateUrl : "app/webService/templates/operationsTable.html",
		replace : true,
		transclude : false,
		compile : function compile(element, attrs) {
			//$log.debug(MODULE_TAG+" compile");
			return {
				pre : function preLink(scope, element, attrs) {
					//$log.debug(MODULE_TAG+"preLink",scope.webServiceInfo);
				},
				post : function postLink(scope, element, attrs, accordionController) {
					//$log.debug(MODULE_TAG+" postLink", scope.webServiceInfo);
					//Catch scope event here:
					scope.operationRequest = function(operationName){
						scope.$emit('operationRequest', operationName);
					}	
				}
			}
		},
		controller : ['$scope',
		function(scope, $scope, $parent) {
			//$log.debug(MODULE_TAG+" controller",scope.webServiceInfo);
			var vm = this;
			//Init vm variables here:		
		}],

	}
}]);
