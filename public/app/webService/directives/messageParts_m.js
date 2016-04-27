angular.module('messageParts_m', []).directive("messageParts", ['$log', '$timeout',
function($log, $timeout) {
	return {
		restrict : "E",
    require : 'ng-model',
		priority : 0,
		terminal : false,
		scope : {
			msgInfo : "=info", //one way @ doesn't work ???
			msgSubmit : "&submit", //method binding
			backToOperations : "&back",
		},
		templateUrl : "app/webService/templates/messageParts.html",
		replace : false, //messageParts directive must be parent of messageForm !
		transclude : false,
		compile : function compile(element, attrs) {
			//$log.debug("messageParts compile");
			return {
				pre : function preLink(scope, element, attrs) {
					//$log.debug("messageParts preLink",scope.msgInfo);
				},
				post : function postLink(scope, element, attrs, ngModelC) {
					//$log.debug("messageParts postLink",scope.msgInfo);
          
          function readyToSend() {
            var result = false;
            var parts = scope.userSubmit.parts;
            for (var i = 0; i < parts.length; ++i) {
              if(parts[i].readyToSend === false)
                return false;
            }
            return true;
          }

					scope.msgRequest = function() {
             if (readyToSend()){
                ngModelC.$setViewValue(scope.userSubmit);
                scope.msgSubmit();
              }else{
                scope.alertMsg = {'show': true, 'message': 'Miss (sub)form(s) submit !'};
                var t ="t";
                $timeout(function() {
                  scope.alertMsg = {'show': false, 'message': null};
                },1000);       
              }
					};
					
				}
			}
		},
		controller : ['$scope',
		function(scope, $scope, $parent) {
			//$log.debug("messageParts controller",scope.msgInfo);
			var vm = this;
      
      initialize();
      
      function initialize(){
        scope.alertMsg = {'show': false, 'message': null};
        scope.userSubmit = {'operation': scope.msgInfo.operation, 'message': scope.msgInfo.message,
        'parts': []};   
      }
		}],
	}
}]);
