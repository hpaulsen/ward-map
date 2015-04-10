'use strict';

angular.module('wardMapApp')
	.controller('regionCtrl', function ($scope, regionService) {
		$scope.regions = regionService.regions; // getRegions();

		$scope.rowClick = function(region){
			console.log(region);
		}

		$scope.onError = function(error){
			alert(error);
		}

		$scope.onComplete = function(){
		}

		$scope.toggleItem = function(item){
			item.visible = !item.visible;
		}

		$scope.deleteItem = function(item){
			if (confirm("Are you sure you want to delete this region?")){
				regionService.delete(item);
			}
		}

		$scope.editItem = function(item){
			item.editable = !item.editable;
		}

		$scope.zoomToItem = function(item){
			item.zoom();
		}

		$scope.zoomToRegions = function(){
			if ($scope.regions.length > 0){
				var bounds = $scope.regions[0].bounds;
				for (var i=1; i<$scope.regions.length; i++){
					bounds = bounds.union($scope.regions[i].bounds);
				}
				var map = $scope.regions[0].map;
				map.fitBounds(bounds);
			}
		}

		$scope.deleteRegions = function(){
			if ($scope.regions.length > 0 && confirm("Are you sure you want to delete all regions?")){
				while ($scope.regions.length){
					regionService.delete($scope.regions[0]);
				}
			}
		}

		$scope.gridOptions = {
			data: 'regions',
			rowTemplate:
			"<div ng-click=\"rowClick(row.entity)\" ng-style=\"{ 'cursor': row.cursor }\" ng-repeat=\"col in renderedColumns\" ng-class=\"col.colIndex()\" class=\"ngCell {{col.cellClass}}\">\r" +
			"\n" +
			"\t<div class=\"ngVerticalBar\" ng-style=\"{height: rowHeight}\" ng-class=\"{ ngVerticalBarVisible: !$last }\">&nbsp;</div>\r" +
			"\n" +
			"\t<div ng-cell></div>\r" +
			"\n" +
			"</div>"
			,
			rowHeight: 38,
			columnDefs: [
				{ field: 'name', displayName: 'Region', enableCellEdit: true },
				{
					field: 'color',
					displayName: 'Color',
					cellTemplate: '<div class="ngCellText"><spectrum-colorpicker class="colt+col.index" ng-model="COL_FIELD"></spectrum-colorpicker></div>'
				},
				{
					displayName: 'Actions',
					cellTemplate: '<div class="ngCellText"><span title="{{row.entity.visible?\'hide\':\'show\'}}" class="fa {{row.entity.visible?\'fa-eye\':\'fa-eye-slash\'}}" ng-click="$event.stopPropagation();toggleItem(row.entity);"></span> <span title="delete" class="fa fa-remove" ng-click="$event.stopPropagation();deleteItem(row.entity);"></span> <span title="edit" class="fa fa-edit {{row.entity.editable?\'selected\':\'\'}}" ng-click="$event.stopPropagation();editItem(row.entity);"></span> <span title="zoom to" class="fa fa-search-plus" ng-click="$event.stopPropagation();zoomToItem(row.entity);"></span></div>'
				}
			]
		};
	});
