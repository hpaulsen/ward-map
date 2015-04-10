'use strict';

/**
 * @ngdoc directive
 * @name wardMapApp.directive:openRegionFile
 * @description
 * # openRegionFile
 */
angular.module('wardMapApp')
	.directive('openRegionFile', function (regionService) {

		function parseRegions(geoJson,properties){
			switch (geoJson.type){
				case 'Polygon':
					var polygons = [];
					for (var i=0; i<geoJson.coordinates.length; i++){
						var coords = [];
						for (var j=0; j<geoJson.coordinates[i].length; j++){
							coords.push(new google.maps.LatLng(geoJson.coordinates[i][j][1],geoJson.coordinates[i][j][0]));
						}
						polygons.push(coords);
					}
					var region = new google.maps.Polygon({
						paths: polygons,
						strokeWeight: 1
					});
					var options = {color:'#'+Math.floor(Math.random()*16777215).toString(16)}
					if (typeof properties !== 'undefined' && typeof properties.name !== 'undefined')
						options.name = properties.name;
					regionService.add(google.maps.drawing.OverlayType.POLYGON,region,options);
					break;
				case 'MultiPolygon':
					for (var i=0; i<geoJson.coordinates.length; i++){
						var result = parseRegions(geoJson.coordinates[i]);
						if (result !== true)
							return result;
					}
					break;
				case 'GeometryCollection':
					for (var i=0; i<geoJson.geometries.length; i++){
						var result = parseRegions(geoJson.geometries[i]);
						if (result !== true) return result;
					}
					break;
				case 'Feature':
					var result = parseRegions(geoJson.geometry,geoJson.properties);
					if (result !== true) return result;
					break;
				case 'FeatureCollection':
					for (var i=0; i<geoJson.features.length; i++){
						var result = parseRegions(geoJson.features[i]);
						if (result !== true) return result;
					}
					break;
				// Unsupported types
				case 'Point':
					return 'Point type is not supported';
					break;
				case 'MultiPoint':
					return 'MultiPoint type is not supported';
					break;
				case 'LineString':
					return 'LineString type is not supported';
					break;
				case 'MultiLineString':
					return 'MultiLineString type is not supported';
					break;
				default:
					return 'Error processing file';
			}
			return true;
		}

		return {
			template: '<input type="file" accept="application/vnd.google-earth.kml+xml"><script type="text/javascript">$(":file").filestyle({input:false,buttonText:"Load KML File",badge:false});</script>',
			restrict: 'E',
			link: function postLink(scope, element, attrs) { // jshint ignore:line
				element.on('change',function(e){
					var file = (e.srcElement || e.target).files[0];
					if (file.type != 'application/vnd.google-earth.kml+xml') {
						if (typeof scope.error == 'function') scope.error('Files of type "'+file.type+'" are not supported. Only kml files may be read at this time.');
					} else {
						var reader = new FileReader();
						reader.onload = function(e){
							var dom = (new DOMParser()).parseFromString(e.target.result,'text/xml');
							var result = toGeoJSON.kml(dom);
							result = parseRegions(result);
							if (result === true){
								scope.$apply(function(){
									if (typeof scope.complete == 'function')
										scope.complete();
								});
							} else {
								console.log(result);
								scope.$apply(function(){
									if (typeof scope.error == 'function')
										scope.error('Error reading file: '+result);
								});
							}
						};
						reader.readAsText(file);
					}
				});
			},
			scope: {
				complete: '=onComplete',
				error: '=onError'
			}
		};
	});
