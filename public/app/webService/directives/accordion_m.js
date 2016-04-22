angular.module('accordion_m', []).directive("accordion", ['$log',
function($log) {
	return {
		restrict : "E",
		scope: {},
		template: "<div class='accordion' ng-transclude></div>",
		replace: true,
		transclude : true,
		compile : function compile(element, attrs) {
			//$log.debug("accordion compile");
			return {
				pre : function preLink(scope, element, attrs) {
					//$log.debug("accordion preLink");
				},
				post : function postLink(scope, element, attrs) {
					//$log.debug("accordion postLink");
				}
			}
		},
		controller : ['$scope',
		function(scope, $scope) {
			//$log.debug("accordion controller");
			var accordionGroups = [];

			this.registerGroup = function(group) {
				accordionGroups.push(group);
			};

			this.toggleGroup = function(selectedGroup) {
				angular.forEach(accordionGroups, function(group) {
					if (group != selectedGroup) {
						group.visible = false;
					}
				});
			};
		}],

	}

}]);
