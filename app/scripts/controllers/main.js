'use strict';

/**
 * @ngdoc function
 * @name wardMapApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the wardMapApp
 */
angular.module('wardMapApp')
	.controller('MainCtrl', function ($scope, peopleService) {
		$scope.people = peopleService.people;
		$scope.households = peopleService.households;

		$scope.rowClick = function(household){
			console.log(household);
		}

		$scope.gridOptions = {
			data: 'households',
			rowTemplate:
			"<div ng-click=\"rowClick(row.entity)\" ng-style=\"{ 'cursor': row.cursor }\" ng-repeat=\"col in renderedColumns\" ng-class=\"col.colIndex()\" class=\"ngCell {{col.cellClass}}\">\r" +
			"\n" +
			"\t<div class=\"ngVerticalBar\" ng-style=\"{height: rowHeight}\" ng-class=\"{ ngVerticalBarVisible: !$last }\">&nbsp;</div>\r" +
			"\n" +
			"\t<div ng-cell></div>\r" +
			"\n" +
			"</div>"
			,
			columnDefs: [
				{ field: 'name', displayName: 'Name' },
				{
					field: 'address1',
					displayName: 'Address'
				},
				{ field:'phone', displayName:'Phone' }
			]
		};
	});
