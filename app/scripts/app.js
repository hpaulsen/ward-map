'use strict';

/**
 * @ngdoc overview
 * @name wardMapApp
 * @description
 * # wardMapApp
 *
 * Main module of the application.
 */
angular
	.module('wardMapApp', [
		'ngAnimate',
		'ngRoute',
		'ngSanitize',
		'ui.sortable',
		'google-maps',
		'ngStorage',
		'ngGrid'
	])
	.config(['$routeProvider',function($routeProvider){
		$routeProvider.when('/about', {
			templateUrl: 'views/about.html',
			controller: 'AboutCtrl'
		}).otherwise({
			templateUrl: 'views/main.html',
			controller: 'MainCtrl'
		});
	}]);
