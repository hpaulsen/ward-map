'use strict';

/**
 * @ngdoc function
 * @name wardMapApp.controller:MapCtrl
 * @description
 * # MapCtrl
 * Controller of the wardMapApp
 */
angular.module('wardMapApp')
	.controller('MapCtrl', function ($scope, peopleService, geocoderService) {

		$scope.map = {
			center: {
				latitude: 0,
				longitude: 0
			},
			zoom: 1
		};

		$scope.markers = [];
		$scope.errors = [];
		$scope.bounds = null;

		$scope.events = {
			click: function (event, eventType, object) {
				console.log(object.coords.id);
				console.log(peopleService.households[object.coords.id]);
			}
		}

		$scope.geocoding = false;
		$scope.geocodingIndex = 0;
		$scope.geocodingTotal = 0;
		$scope.geocodingSuccess = 0;
		$scope.geocodingFail = 0;

		$scope.onComplete = function(){
			var data = peopleService.households;
			$scope.geocoding = true;
			$scope.geocodingTotal = Object.keys(data).length;
			var n=null, s=null, e=null, w=null;
			for (var i in data){
				var household = data[i];
				geocoderService.geocodeAddress(household.address1,i)
					.then(
					function(a){
						var household = peopleService.households[a.id];
						household.formattedAddress = a.formattedAddress;
						household.geocodeType = a.types;
						household.geocodePartial = a.partial;

						if (n == null){
							n = s = a.latitude;
							e = w = a.longitude;
						} else {
							var boundsChanged = false;
							if (a.latitude > n) {boundsChanged = true; n = a.latitude;}
							else if (a.latitude < s) {boundsChanged = true; s = a.latitude;}
							if (a.longitude > e) {boundsChanged = true; e = a.longitude;}
							else if (a.longitude < w) {boundsChanged = true; w = a.longitude;}
							if ($scope.bounds === null || boundsChanged){
								$scope.bounds = {
									northeast: {
										latitude: n,
										longitude: e
									},
									southwest: {
										latitude: s,
										longitude: w
									}
								}
							}
						}

						$scope.geocodingIndex++;
						$scope.geocodingSuccess++;
						if ($scope.geocodingIndex == $scope.geocodingTotal-1) {
							$scope.geocoding = false;
						}
						a.icon = 'http://maps.google.com/mapfiles/kml/paddle/blu-blank-lv.png';
						$scope.markers.push(a);
					},
					function(e){
						var household = peopleService.households[e.id];
						household.error = e;
						$scope.geocodingIndex++;
						$scope.geocodingFail++;
						if ($scope.geocodingIndex == $scope.geocodingTotal-1) {
							$scope.geocoding = false;
							$scope.bounds = new google.maps.LatLngBounds(new google.maps.LatLng(s,w),new google.maps.LatLng(n,e));
						}
					}
				);
			}
		};
	});
