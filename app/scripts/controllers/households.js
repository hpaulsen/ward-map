'use strict';

/**
 * @ngdoc function
 * @name wardMapApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the wardMapApp
 */
angular.module('wardMapApp')
	.controller('householdsCtrl', function ($rootScope, $scope, peopleService, geocoderService, Marker) {
		$scope.people = peopleService.people;
		$scope.households = peopleService.households;
		$scope.bounds = null;

		function fillBounds(){
			if ($scope.households.length > 0){
				var i=0;
				while (i<$scope.households.length && typeof $scope.households[i].marker == 'undefined' || $scope.households[i].marker == null)
					i++;
				if (i<$scope.households.length){
					var pos = $scope.households[i].marker.marker.getPosition();
					$scope.bounds = new google.maps.LatLngBounds(pos,pos);
					for (i=i; i<$scope.households.length; i++){
						if (typeof $scope.households[i].marker != 'undefined' && $scope.households[i].marker != null)
							$scope.bounds.extend($scope.households[i].marker.marker.getPosition());
					}
				} else {
					$scope.bounds = new google.maps.LatLngBounds(new google.maps.LatLng(0,0),new google.maps.LatLng(0,0));
				}
			} else {
				$scope.bounds = new google.maps.LatLngBounds(new google.maps.LatLng(0,0),new google.maps.LatLng(0,0));
			}
		}

		fillBounds();

		$scope.rowClick = function(household){
			console.log(household);
		};

		$scope.tableColumns = [
			{ field: 'name', displayName: 'Name' },
			{ field: 'address', displayName: 'Address' },
			{ field: 'formattedAddress', displayName: 'Geocoded Address' },
			{ field: 'geocodeApproximate', displayName: 'Location is Accurate', cellTemplate: '<div class="ngCellText">{{row.getProperty(col.field) | yes_no_inverse}}</div>' }
		];

		$scope.gridOptions = {
			data: 'households',
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

		$scope.clearGeocodes = function(){
			geocoderService.purge();
		};

		$scope.zoomToMarkers = function(){
			$rootScope.map.control.getGMap().fitBounds($scope.bounds);
		};

		$scope.onComplete = function(){
			var data = peopleService.households;
			$scope.geocoding = true;
			$scope.geocodingTotal = Object.keys(data).length;
			//var n=null, s=null, e=null, w=null;
			for (var i in data){
				var j = typeof data[i];
				if (j !== "object") continue;
				var household = data[i];
				geocoderService.geocodeAddress(household.address,i)
					.then(
					function(a){
						var household = peopleService.households[a.id];
						household.formattedAddress = a.formattedAddress;
						household.geocodeApproximate = a.types[0] != 'street_address' && a.types[0] != 'premise' && a.types[0] != 'subpremise' && a.types[0] != 'park';
						var icon = household.geocodeApproximate ? 'https://maps.google.com/mapfiles/kml/paddle/pause-lv.png' : 'https://maps.google.com/mapfiles/kml/paddle/blu-blank-lv.png',
							marker = peopleService.findMarker(a.latitude, a.longitude);
						if (marker === false){
							marker = new Marker(a.latitude, a.longitude, icon, {});
							peopleService.addMarker(marker);
						}
						marker.addHousehold(household);

						//google.maps.event.addListener(marker.marker,'click',function(a){console.log(a);});

						if ($scope.bounds == null)
							$scope.bounds = new google.maps.LatLngBounds(marker.marker.getPosition(),marker.marker.getPosition());
						else
							$scope.bounds.extend(marker.marker.getPosition());

						$scope.geocodingIndex++;
						$scope.geocodingSuccess++;
						if ($scope.geocodingIndex == $scope.geocodingTotal-1) {
							$scope.geocoding = false;
							$rootScope.map.control.getGMap().fitBounds($scope.bounds);
						}
					},
					function(e){
						var household = peopleService.households[e.id];
						household.error = e;
						$scope.geocodingIndex++;
						$scope.geocodingFail++;
						if ($scope.geocodingIndex == $scope.geocodingTotal-1) {
							$scope.geocoding = false;
						}
					}
				);
			}
		};

	});
