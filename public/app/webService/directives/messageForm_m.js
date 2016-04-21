angular.module('messageForm_m', []).directive("messageForm", ['$log','$compile',
function($log,$compile) {
	return {
		restrict : "E",
		require : "^accordion", 
		priority : 0,
		terminal : false,
		scope : {
			formInfo : "=info",
		},
		templateUrl : "app/webService/templates/messageForm.html",
		replace : true,
		transclude : false,
		compile : function compile(element, attrs) {
			//$log.debug("messageForm compile");
			return {
				pre : function preLink(scope, element, attrs) {
					//$log.debug("messageForm preLink",scope.formInfo);
				},
				post : function postLink(scope, element, attrs, accordionController) {
					//$log.debug("messageForm postLink", scope.formInfo);

					//instead in template to avoid an angular throw into an endless loop,
					//because it tries to render the operationForm directive
					//regardless if formInfo has forms or not :
					//DO THIS =>
					if (scope.formInfo.forms.length !== 0) {
						$compile('<data-accordion ><data-message-form ng-repeat="form in formInfo.forms" data-info="form"></data-message-form></data-accordion>')(scope, function(cloned, scope) {
							var nodeF = angular.element(element).find('form');
						    nodeF.prepend(cloned);
						});
					};

					accordionController.registerGroup(scope); //TODO
					scope.visible = false;

					scope.toggle = function() {
						scope.visible = !scope.visible;
						accordionController.toggleGroup(scope);  //TODO
					}

					scope.reset = function() {
						scope.respForm = angular.copy(scope.formInfo.defaultImputsResp);
					}
					scope.formSubmit = function() {
						//scope.formInfo.defaultResp = scope.respForm;
					}
					
					//scope.respForm = angular.copy(scope.formInfo.defaultResp);
				}
			}
		},
		controller : ['$scope',
		function(scope, $scope, $parent) {
			//$log.debug("operationForm controller",scope.formInfo);
			var vm = this;
			vm.respForm = angular.copy(scope.formInfo.defaultImputsResp);
		}],

	}
}]);
