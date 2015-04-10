'use strict';

/**
 * @ngdoc function
 * @name wardMapApp.controller:MapCtrl
 * @description
 * # MapCtrl
 * Controller of the wardMapApp
 */
angular.module('wardMapApp')
	.controller('MapCtrl', function ($scope, peopleService, regionService) {

		$scope.map = {
			center: {
				latitude: 0,
				longitude: 0
			},
			zoom: 1,
			control: {},
			bounds: null
		};

		//$scope.markers = [];
		$scope.households = peopleService.households;
		$scope.regions = regionService.regions;
		$scope.errors = [];

		$scope.events = {
			click: function (event, eventType, object) {
				console.log(object.id);
				console.log(peopleService.getHouseholdDetail(object.id));
			}
		}

		$scope.drawingManagerOptions = {
			drawingMode: null,
			drawingControl: true,
			drawingControlOptions: {
				position: google.maps.ControlPosition.TOP_CENTER,
				drawingModes: [
					google.maps.drawing.OverlayType.POLYGON,
					google.maps.drawing.OverlayType.CIRCLE,
					google.maps.drawing.OverlayType.RECTANGLE
				]
			},
			circleOptions: {
				strokeWeight: 1,
				clickable: false,
				fillOpacity: 0.5
				//editable: true
			},
			polygonOptions: {
				strokeWeight: 1,
				clickable: false,
				fillOpacity: 0.5
				//editable: true
			},
			rectangleOptions: {
				strokeWeight: 1,
				clickable: false,
				fillOpacity: 0.5
				//editable: true
			}
		};

		$scope.drawingManagerControl = {
			getDrawingManager: null
		};

		$scope.$watch('drawingManagerControl.getDrawingManager',function(){
			if (typeof $scope.drawingManagerControl.getDrawingManager == "function"){
				var drawingManager = $scope.drawingManagerControl.getDrawingManager();
				google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event){
					var i = regionService.add(event.type,event.overlay,{
						color:'#'+Math.floor(Math.random()*16777215).toString(16),
						map: $scope.map.control.getGMap()
					});
					$scope.$apply();
				});
			}
		});

		$scope.$watch('regions.length',function(){
			var mapInstance = $scope.map.control.getGMap(),
				region = $scope.regions[0],
				bounds;
			if (region) {
				bounds = region.bounds;
				region.map = mapInstance;
			}
			for (var i=1; i<$scope.regions.length; i++){
				$scope.regions[i].map = mapInstance; // make region visible

				// adjust the map bounds to include the region
				bounds.union($scope.regions[i].bounds);
			}
			if (bounds){
				var newBounds = {
					northeast: {
						latitude: bounds.getNorthEast().lat(),
						longitude: bounds.getNorthEast().lng()
					},
					southwest: {
						latitude: bounds.getSouthWest().lat(),
						longitude: bounds.getSouthWest().lng()
					}
				}
				$scope.map.bounds = newBounds;
			}
		});

	});
