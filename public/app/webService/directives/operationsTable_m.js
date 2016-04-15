angular.module('operationsTable_m', [])
.constant('MODULE_TAG', 'operationsTable_m')
.directive("operationsTable", ['MODULE_TAG', '$log','$compile',
function(MODULE_TAG,$log,$compile) {
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
				}
			}
		},
		controller : ['$scope',
		function(scope, $scope, $parent) {
			//$log.debug(MODULE_TAG+" controller",scope.webServiceInfo);
			var vm = this;
			vm.operationRequest = function(operationName){
				scope.$emit('operationRequest', operationName);
			}			
		}],

	}
}]);
