angular.module('messageParts_m', [])
		.directive("messageParts", ['$log', function ($log) {
				return {
						restrict: "E",
						priority: 0, 
						terminal: false, 
						scope: {
								msgInfo: "=info",//one way @ doesn't work ???
								msgSubmit: "&submit",//method binding
								backToOperations: "&back",
						},
						templateUrl: "app/webService/templates/messageParts.html",
						replace: false,//messageParts directive must be parent of messageForm !
						transclude: false,
						compile: function compile(element, attrs) {
								//$log.debug("messageParts compile");
								return{
										pre: function preLink(scope, element, attrs) {
												//$log.debug("messageParts preLink",scope.msgInfo);
										},
										post: function postLink(scope, element, attrs) {
												//$log.debug("messageParts postLink",scope.msgInfo);
												
										}
								}
						},
						controller: ['$scope', function (scope,$scope,$parent) {
							//$log.debug("messageParts controller",scope.msgInfo);
							var vm = this;
							vm.isValideMsg = false;//(scope.msgInfo.parts[i].form.valide === true); 
							
						}],
				}
		}]);
