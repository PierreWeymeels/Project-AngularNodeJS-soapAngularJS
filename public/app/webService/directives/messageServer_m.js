angular.module('messageServer_m', [])
.directive("messageServer", ['$log','$compile',
function($log,$compile) {
	var MODULE_TAG = 'messageServer_m';
	return {
		restrict : "E",
		priority : 0,
		terminal : false,
		scope : {
			msgServer: "=info",
			back: "&",
		},
		templateUrl : "app/webService/templates/messageServer.html",
		replace : true,
		transclude : false,
		compile : function compile(element, attrs) {
			//$log.debug(MODULE_TAG+" compile");
			return {
				pre : function preLink(scope, element, attrs) {
					//$log.debug(MODULE_TAG+"preLink");
				},
				post : function postLink(scope, element, attrs, accordionController) {
					//$log.debug(MODULE_TAG+" postLink");
          
				}
			}
		},
		controller : ['$scope',
		function(scope, $scope, $parent) {
			//$log.debug(MODULE_TAG+" controller");
			var vm = this;
			//Init vm variables here:		
		}],

	}
}]);

