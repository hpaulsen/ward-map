'use strict';

/**
 * @ngdoc function
 * @name wardMapApp.controller:AnalyzeCtrl
 * @description
 * # AnalyzeCtrl
 * Controller of the wardMapApp
 */
angular.module('wardMapApp')
  .controller('AnalyzeCtrl', function ($scope, regionService, peopleService) {
		$scope.regions = regionService.regions;
		$scope.people = peopleService.people;
		$scope.selectedRegion = {};

		$scope.filteredData = [];

		var customFilters = [
				{
					name: 'People',
					condition: [],
					filter: function(item){ return true; },
					count: null
				},
				{
					name: 'Members',
					condition: ['yearsMember'],
					filter: function(item){ return item.yearsMember > 0; },
					count: null
				},
				{
					name: 'Young Men',
					condition: ['age','gender'],
					filter: function(item){
						return item.age >= 12 && item.age <= 18 && item.gender == 'male';
					},
					count: null
				}
			],
			availableFilters = [];

		$scope.filters = [];
		$scope.MAX_VALUE_COUNT = 4;

		var selectFilters = function(){
			console.log('selecting filters');
			// Analyze fields for unique values
			var fieldValueCounts = {};
			// Note: this method assumes all items are identical...
			var test = peopleService.people[0],
				fields = Object.keys(test);
			for (var i=0; i<fields.length; i++){
				for (var j=0; j<peopleService.people.length; j++){
					var field = fields[i],
						value = peopleService.people[j][field];
					if (typeof fieldValueCounts[field] == 'undefined'){
						fieldValueCounts[field] = {
							numValues: 1,
							type: typeof value
						};
						fieldValueCounts[field][value] = 1;
					} else {
						if (typeof fieldValueCounts[field][value] == 'undefined'){
							fieldValueCounts[field][value] = 1;
							fieldValueCounts[field].numValues++;
						} else {
							fieldValueCounts[field][value]++;
						}
					}
					if (fieldValueCounts[field].numValues > $scope.MAX_VALUE_COUNT)
						break; // no need to continue testing...
				}
			}
			//for (var i=0; i<peopleService.people.length; i++){
			//	for (var field in peopleService.people[i]){
			//		var value = peopleService.people[i][field];
			//		if (typeof fieldValueCounts[field] == 'undefined'){
			//			fieldValueCounts[field] = {numValues:1};
			//			fieldValueCounts[field][value] = 1;
			//		} else {
			//			if (typeof fieldValueCounts[field][value] == 'undefined'){
			//				fieldValueCounts[field][value] = 1;
			//				fieldValueCounts[field].numValues++;
			//			} else {
			//				fieldValueCounts[field][value]++;
			//			}
			//		}
			//	}
			//}

			// Add automatic filters for data having fewer than 4 unique values
			for (var field in fieldValueCounts){
				var count = fieldValueCounts[field].numValues;
				if (count > 1 && count < $scope.MAX_VALUE_COUNT){
					var type = fieldValueCounts[field].type;
					for (var value in fieldValueCounts[field]){
						if (value == 'numValues' || value == 'type') continue;
						var testValue = value;
						if (type == 'boolean'){
							if (value === 'true') testValue = true;
							else if (value === 'false') testValue = false;
							else if (value === 'null') testValue = null;
						}
						availableFilters.push({
							name: field+': '+value,
							condition: [],
							field: field,
							testValue: testValue,
							filter: function(item){
								return item[this.field] === this.testValue;
							}
						});
					}
				}
			}

			// Add custom filters if applicable
			for (var i=0; i<customFilters.length; i++){
				var filter = customFilters[i];
				if (typeof filter.condition != 'undefined' && filter.condition.length > 0){
					var isOk = true;
					for (var j=0; j<filter.condition.length; j++){
						if (typeof fieldValueCounts[filter.condition[j]] == 'undefined'){
							// This required field is missing...
							isOk = false;
							break;
						}
					}
					if (isOk)
						availableFilters.push(filter);
				}
			}

		};

		var calculateFilters = function(){
			// Figure out which members are in the area
			var households = [];
			for (var i=0; i<peopleService.households.length; i++){
				if ($scope.selectedRegion && typeof $scope.selectedRegion.contains != 'undefined' && $scope.selectedRegion.contains(new google.maps.LatLng(peopleService.households[i].latitude,peopleService.households[i].longitude))){
					households.push(peopleService.households[i]);
				}
			}

			// Go through each filter
			for (var i=0; i<$scope.filters.length; i++){
				$scope.filters[i].count = 0;
				for (var j=0; j<households.length; j++){
					var people = peopleService.getHouseholdMembers(households[j].id);
					for (var k=0; k<people.length; k++){
						if ($scope.filters[i].filter(peopleService.people[people[k]]))
							$scope.filters[i].count++;
					}
				}
			}
		};

		$scope.$watch('selectedRegion',function(){
			if (peopleService.people.length > 0){
				if (availableFilters.length == 0){
					selectFilters();
					$scope.filters = availableFilters;
				}
				calculateFilters();
			}
		});
  });
