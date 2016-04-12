angular.module('operationForms_m', [])
		.directive("operationForms", ['$log', function ($log) {
				return {
						restrict: "E",
						priority: 0, 
						terminal: false, 
						scope: {
								requestInfo: "=info",//one way @ doesn't work ???
								formSubmit: "&submit",//method binding
								backToOperations: "&back",
						},
						templateUrl: "app/webService/templates/operationForms.html",
						replace: false,//operationForms directive must be parent of operationForm !
						transclude: false,
						compile: function compile(element, attrs) {
								//$log.debug("operationForms compile");
								return{
										pre: function preLink(scope, element, attrs) {
												//$log.debug("operationForms preLink",scope.formInfo);
										},
										post: function postLink(scope, element, attrs) {
												//$log.debug("operationForms postLink",scope.formInfo);
												
										}
								}
						},
						controller: ['$scope', function (scope,$scope,$parent) {
							$log.debug("operationForms controller",scope.requestInfo);
							var vm = this;
							vm.isForm = (scope.requestInfo.forms.length !== 0); 
							
						}],
				}
		}]);
