'use strict';

/**
 * @ngdoc function
 * @name wardMapApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the wardMapApp
 */
angular.module('wardMapApp')
	.controller('householdsCtrl', function ($scope, peopleService, geocoderService) {
		$scope.people = peopleService.people;
		$scope.households = peopleService.households;
		$scope.bounds = {
			northeast: {
				latitude: null,
				longitude: null
			},
			southwest: {
				latitude: null,
				longitude: null
			}
		};

		$scope.rowClick = function(household){
			console.log(household);
		}

		$scope.tableColumns = [
			{ field: 'name', displayName: 'Name' },
			{ field: 'address1', displayName: 'Address' },
			{ field: 'phone', displayName: 'Phone' },
			{ field: 'email', displayName: 'E-mail' },
			{ field: 'formattedAddress', displayName: 'Geocoded Address' },
			{ field: 'geocodeType', displayName: 'Geocode Type' },
		];

		$scope.gridOptions = {
			data: 'people',
			showColumnMenu: true,
			rowTemplate:
			"<div ng-click=\"rowClick(row.entity)\" ng-style=\"{ 'cursor': row.cursor }\" ng-repeat=\"col in renderedColumns\" ng-class=\"col.colIndex()\" class=\"ngCell {{col.cellClass}}\">\r" +
			"\n" +
			"\t<div class=\"ngVerticalBar\" ng-style=\"{height: rowHeight}\" ng-class=\"{ ngVerticalBarVisible: !$last }\">&nbsp;</div>\r" +
			"\n" +
			"\t<div ng-cell></div>\r" +
			"\n" +
			"</div>"
			,
			columnDefs: 'tableColumns'
		};

		$scope.geocoding = false;
		$scope.geocodingIndex = 0;
		$scope.geocodingTotal = 0;
		$scope.geocodingSuccess = 0;
		$scope.geocodingFail = 0;

		$scope.onError = function(error){
			alert(error);
		};

		function analyzeColumns(){
			if (peopleService.people.length){
				var dataRow = peopleService.people[0];
				var columns = [];
				for (var prop in dataRow){
					var column = {
						field: prop,
						displayName: prop
					};
					columns.push(column);
				}
				$scope.tableColumns = columns;
			}
		}

		$scope.onComplete = function(){
			analyzeColumns();
			
			var data = peopleService.households,
				bounds = null;
			$scope.geocoding = true;
			$scope.geocodingTotal = Object.keys(data).length;
			//var n=null, s=null, e=null, w=null;
			for (var i in data){
				var j = typeof data[i];
				if (j !== "object") continue;
				var household = data[i];
				geocoderService.geocodeAddress(household.address1,i)
					.then(
					function(a){
						var household = peopleService.households[a.id];
						if (typeof household == 'undefined') console.log(a);
						household.formattedAddress = a.formattedAddress;
						household.geocodeType = a.types;
						household.geocodePartial = a.partial;
						household.latitude = a.latitude;
						household.longitude = a.longitude;
						household.icon = 'http://maps.google.com/mapfiles/kml/paddle/blu-blank-lv.png';

						var latlng = new google.maps.LatLng(a.latitude, a.longitude);
						if (bounds == null){
							bounds = new google.maps.LatLngBounds(latlng,latlng);
						} else {
							bounds.extend(latlng);
						}

						$scope.geocodingIndex++;
						$scope.geocodingSuccess++;
						if ($scope.geocodingIndex == $scope.geocodingTotal-1) {
							$scope.geocoding = false;
							$scope.bounds.northeast.latitude = bounds.getNorthEast().lat();
							$scope.bounds.northeast.longitude = bounds.getNorthEast().lng();
							$scope.bounds.southwest.latitude = bounds.getSouthWest().lat();
							$scope.bounds.southwest.longitude = bounds.getSouthWest().lng();
						}
					},
					function(e){
						var household = peopleService.households[e.id];
						household.error = e;
						$scope.geocodingIndex++;
						$scope.geocodingFail++;
						if ($scope.geocodingIndex == $scope.geocodingTotal-1) {
							$scope.geocoding = false;
							$scope.bounds.northeast.latitude = bounds.getNorthEast().lat();
							$scope.bounds.northeast.longitude = bounds.getNorthEast().lng();
							$scope.bounds.southwest.latitude = bounds.getSouthWest().lat();
							$scope.bounds.southwest.longitude = bounds.getSouthWest().lng();
						}
					}
				);
			}
		};

	});
