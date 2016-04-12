angular.module('operationForm_m', []).directive("operationForm", ['$log','$compile',
function($log,$compile) {
	return {
		restrict : "E",
		require : "^accordion", 
		priority : 0,
		terminal : false,
		scope : {
			formInfo : "=info",
		},
		templateUrl : "app/webService/templates/operationForm.html",
		replace : true,
		transclude : false,
		compile : function compile(element, attrs) {
			//$log.debug("operationForm compile");
			return {
				pre : function preLink(scope, element, attrs) {
					//$log.debug("operationForm preLink",scope.formInfo);
				},
				post : function postLink(scope, element, attrs, accordionController) {
					$log.debug("operationForm postLink", scope.formInfo);

					//instead in template to avoid an angular throw into an endless loop,
					//because it tries to render the operationForm directive
					//regardless if formInfo has forms or not :
					//DO THIS =>
					if (scope.formInfo.forms.length !== 0) {
						$compile('<data-accordion ><data-operation-form ng-repeat="form in formInfo.forms" data-info="form"></data-operation-form></data-accordion>')(scope, function(cloned, scope) {
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
						scope.respForm = angular.copy(scope.formInfo.defaultResp);
					}
					scope.formSubmit = function() {
						scope.formInfo.defaultResp = scope.respForm;
					}
				}
			}
		},
		controller : ['$scope',
		function(scope, $scope, $parent) {
			var vm = this;
			vm.respForm = angular.copy(scope.formInfo.defaultResp);
			//$log.debug("operationForm controller",scope.formInfo);

		}],

	}
}]);
