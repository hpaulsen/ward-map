'use strict';

/**
 * @ngdoc function
 * @name wardMapApp.controller:NavigationCtrl
 * @description
 * # NavigationCtrl
 * Controller of the wardMapApp
 */
angular.module('wardMapApp')
	.controller('NavigationCtrl', function ($scope, $location) {
		$scope.isActive = function (route) {
			return route === $location.path();
		};
	});

