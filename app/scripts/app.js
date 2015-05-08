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
		'uiGmapgoogle-maps',
		'ngStorage',
		'ngGrid',
		'angularSpectrumColorpicker'
	])
	.config(['$routeProvider',function($routeProvider){
		$routeProvider.when('/about', {
			templateUrl: 'views/about.html',
			controller: 'AboutCtrl'
		}).when('/regions', {
			templateUrl: 'views/regions.html',
			controller: 'regionCtrl'
		}).when('/analyze',{
			templateUrl: 'views/analyze.html',
			controller: 'AnalyzeCtrl'
		}).otherwise({
			templateUrl: 'views/households.html',
			controller: 'householdsCtrl'
		});
	}]);
