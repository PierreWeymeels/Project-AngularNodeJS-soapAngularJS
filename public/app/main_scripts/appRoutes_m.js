angular.module('appRoutes_m', ['ngRoute'])
		.config(['$routeProvider', '$locationProvider',
				function ($routeProvider, $locationProvider) {
						$routeProvider
								// route for the home page
								.when('/', {
										templateUrl: 'app/home/views/home.html'
								})
								.when('/webService', {
										templateUrl: 'app/webService/views/webServiceV.html',
										controller: 'webServiceC',
										controllerAs: 'wsC'
								});	
						$locationProvider.html5Mode(true);
				}]);