'use strict';

//var Region = function(type,overlay,options){
//	this.type = type;
//	this.overlay = overlay;
//	this.name = options.name ? options.name : 'untitled';
//	var _map = null;
//	Object.defineProperties(this,{
//		map: {
//			get: function(){
//				return _map;
//			},
//			set: function(v){
//				_map = v;
//				this.overlay.setMap(v);
//			}
//		},
//		visible: {
//			get: function(){
//				return this.overlay.map != null;
//			},
//			set: function(v){
//				this.overlay.map = v ? _map : null;
//			}
//		},
//		color: {
//			get: function(){
//				return this.overlay.fillColor;
//			},
//			set: function(v){
//				this.overlay.setOptions({fillColor:v});
//			}
//		},
//		editable: {
//			get: function(){
//				return this.overlay.getEditable();
//			},
//			set: function(v){
//				this.overlay.setEditable(v);
//			}
//		},
//		bounds: {
//			get: function(){
//				var bounds=null;
//				if (typeof this.overlay.getBounds != 'undefined'){
//					bounds = this.overlay.getBounds();
//				} else if (typeof this.overlay.getPaths != 'undefined'){
//					var paths = this.overlay.getPaths();
//					for (var i=0; i<paths.getLength(); i++){
//						var polyPaths = paths.getAt(i);
//						for (var j=0; j<polyPaths.getLength(); j++){
//							if (bounds == null){
//								bounds = new google.maps.LatLngBounds(polyPaths.getAt(j));
//							} else {
//								bounds.extend(polyPaths.getAt(j));
//							}
//						}
//					}
//				} else bounds = new google.maps.LatLngBounds();
//				return bounds;
//			}
//		}
//	});
//	this.zoom = function(){
//		_map.fitBounds(this.bounds);
//	};
//	if (typeof options !== 'undefined'){
//		if (typeof options.color !== 'undefined'){
//			this.color = options.color;
//		}
//		if (typeof options.visible !== 'undefined'){
//			this.visible = options.visible;
//		}
//	}
//};

//function getPoints(region){
//	if (region.type == google.maps.drawing.OverlayType.POLYGON){
//		var paths = region.overlay.getPaths(),
//			result = [];
//		for (var i=0; i<paths.getLength(); i++){
//			var path = paths.getAt(i),
//				points = [];
//			for (var j=0; j<path.getLength(); j++){
//				points.push({
//					lat: path.getAt(j).lat(),
//					lng: path.getAt(j).lng()
//				});
//			}
//			result.push(points);
//		}
//		return result;
//	}
//	else if (region.type == google.maps.drawing.OverlayType.CIRCLE){
//		return {
//			c: {
//				lat: region.overlay.getCenter().lat(),
//				lng: region.overlay.getCenter().lng()
//			},
//			r: region.overlay.getRadius()
//		};
//	}
//	else if (region.type == google.maps.drawing.OverlayType.RECTANGLE){
//		return {
//			ne: {
//				lat: region.overlay.getBounds().getNorthEast().lat(),
//				lng: region.overlay.getBounds().getNorthEast().lng()
//			},
//			sw: {
//				lat: region.overlay.getBounds().getSouthWest().lat(),
//				lng: region.overlay.getBounds().getSouthWest().lng()
//			}
//		};
//	}
//}
//
//function getOverlay(savedRegion){
//	if (savedRegion.type == google.maps.drawing.OverlayType.POLYGON){
//		var data = [];
//		for (var i=0; i<savedRegion.shape.length; i++){
//			data[i] = [];
//			for (var j=0; j<savedRegion.shape[i].length; j++){
//				data[i].push(new google.maps.latlng(data[i][j].lat,data[i][j].lng));
//			}
//		}
//		return new google.maps.Polygon({
//			paths: data,
//			strokeWeight: 2
//		});
//	}
//	else if (savedRegion.type == google.maps.drawing.OverlayType.CIRCLE){
//		return new google.maps.Circle({
//			center: new google.maps.LatLng(savedRegion.shape.c.lat,savedRegion.shape.c.lng),
//			radius: savedRegion.shape.radius
//		});
//	}
//	else if (savedRegion.type == google.maps.drawing.OverlayType.RECTANGLE){
//		return new google.maps.Rectangle({
//			bounds: new google.maps.LatLngBounds(
//				new google.maps.LatLng(savedRegion.shape.sw.lat,savedRegion.shape.sw.lng),
//				new google.maps.LatLng(savedRegion.shape.ne.lat,savedRegion.shape.ne.lng)
//			)
//		});
//	}
//}
//
//function regionToSavedRegion(region){
//	return {
//		name: region.name,
//		type: region.type,
//		visible: region.visible,
//		color: region.color,
//		shape: getPoints(region)
//	}
//}
//
//function savedRegionToRegion(savedRegion){
//	return new Region(savedRegion.type,getOverlay(savedRegion),{
//		name: savedRegion.name,
//		visible: savedRegion.visible,
//		color: savedRegion.color
//	});
//}

angular.module('wardMapApp')
	.service('regionService',function($localStorage,Region){

		this.regions = [];

		this.getRegions = function(){ return this.regions; };

		this.clear = function(){
			regions.length = 0;
		};

		this.drawingManager = null;

		this.setDrawingManager = function(drawingManager){
			this.drawingManager = drawingManager;
		};

		this.setEditable = function(v){
			for (var i=0; i<this.regions.length; i++){
				this.regions[i].overlay.setEditable(v);
			}
		};

		this.delete = function(region){
			var i = this.regions.indexOf(region);
			if (i > -1){
				this.regions.splice(i,1);
				$localStorage.regions.splice(i,1);
			}
			region.map = null;
		};

		this.add = function(type,overlay,options){
			options.type = type;
			options.overlay = overlay;
			var region = new Region(options),
				index = this.regions.push(region)-1;
			this.saveRegion(region);
			return index;
		};

		var change = function(region){
			$localStorage.regions[region.saveIndex] = region.toSaveObj();
		};

		// Load from local storage
		var VERSION = '1.0.3';
		if ($localStorage.regionsVersion !== VERSION){
			// This should be replaced with migration options
			delete $localStorage.regions;
			$localStorage.regions = [];
			$localStorage.regionsVersion = VERSION;
		}

		if ($localStorage.regions.length){
			for (var i=0; i<$localStorage.regions.length; i++){
				var regionOptions = $localStorage.regions[i];
				regionOptions.saveIndex = i;
				regionOptions.change = change;
				this.regions.push(new Region(regionOptions));
				//var options = {
				//	saveIndex: i
				//};
				//this.regions.push(new Region(options));
			}
		}

		this.saveRegion = function(region){
			$localStorage.regions.push(region.toSaveObj());
			//var obj = {
			//	saveIndex: this.regions.indexOf(region),
			//};
			//$localStorage.regions.push(obj);
		};

		//this.loadRegion = function(regionOptions){
		//	var region = new Region(regionOptions);
		//};

	});
