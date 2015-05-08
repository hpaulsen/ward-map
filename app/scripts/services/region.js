'use strict';

/**
 * @ngdoc service
 * @name wardMapApp.Region
 * @description
 * # Region
 * Factory in the wardMapApp.
 *
 * Constructor function can work two ways:
 * 1) Load from local storage - requires 'saveIndex' in options
 * 2) Create and store in local storage - requires 'type' and 'overlay' in options
 *
 * Other options:
 * - name: a descriptive name (doesn't have to be unique, default "untitled")
 * - color: the fill color of the region
 * - visible: whether the region is visible
 * - map: the google map instance
 * - editable: whether the region can be edited
 */
angular.module('wardMapApp')
	.factory('Region', function () {
		// Constructor
		var VERSION = '1.0.1';

		function Region(options){

			if (options.overlay){
				this.type = options.type;
				if (options.overlay.version == '1.0.1'){
					switch (options.overlay.type){
						case google.maps.drawing.OverlayType.CIRCLE:
							this.overlay = new google.maps.Circle({
								center: new google.maps.LatLng(options.overlay.center_lat,options.overlay.center_lng),
								radius: options.overlay.radius,
								strokeWeight: 1
							});
							break;
						case google.maps.drawing.OverlayType.RECTANGLE:
							this.overlay = new google.maps.Rectangle({
								bounds: new google.maps.LatLngBounds(new google.maps.LatLng(options.overlay.sw_lat,options.overlay.sw_lng), new google.maps.LatLng(options.overlay.ne_lat,options.overlay.ne_lng)),
								strokeWeight: 1
							});
							break;
						case google.maps.drawing.OverlayType.POLYGON:
							var paths = [];
							for (var i=0; i<options.overlay.paths.length; i++){
								var path = [];
								for (var j=0; j<options.overlay.paths[i].length; j++){
									path.push(new google.maps.LatLng(options.overlay.paths[i][j].lat,options.overlay.paths[i][j].lng));
								}
								paths.push(path);
							}
							this.overlay = new google.maps.Polygon({
								paths: paths,
								strokeWeight: 1
							});
							break;
					}
				} else {
					this.overlay = options.overlay;
				}
			}

			//------- Private -------
			this._name = 'untitled'; // placeholder
			var $this = this;
			this.changeListener = function(){
				if (options.change)
					options.change($this);
			};

			//this._saved = false;
			this._map = null;

			this._overlaySaveObj = function(){
				var obj = null;
				switch (this.type){
					case google.maps.drawing.OverlayType.CIRCLE: obj = {
						version: VERSION,
						type: this.type,
						center_lat: this.overlay.getCenter().lat(),
						center_lng: this.overlay.getCenter().lng(),
						radius: this.overlay.getRadius()
					};
						break;
					case google.maps.drawing.OverlayType.RECTANGLE: obj = {
						version: VERSION,
						type: this.type,
						ne_lat: this.overlay.getBounds().getNorthEast().lat(),
						ne_lng: this.overlay.getBounds().getNorthEast().lng(),
						sw_lat: this.overlay.getBounds().getSouthWest().lat(),
						sw_lng: this.overlay.getBounds().getSouthWest().lng()
					};
						break;
					case google.maps.drawing.OverlayType.POLYGON:
						var obj = {type: this.type, version: VERSION, paths: []};
						for (var i=0; i<this.overlay.getPaths().getLength(); i++){
							var path = [];
							for (var j=0; j<this.overlay.getPaths().getAt(i).getLength(); j++){
								path.push({
									lat: this.overlay.getPaths().getAt(i).getAt(j).lat(),
									lng: this.overlay.getPaths().getAt(i).getAt(j).lng()
								});
							}
							obj.paths.push(path);
						}
						break;
				}
				return obj;
			};

			//------- Public properties -------
			this.saveIndex = null;

			//------- Public methods -------
			this.zoom = function(){
				this._map.fitBounds(this.bounds);
			};
			this.toSaveObj = function(){
				return {
					name: this.name,
					color: this.color,
					visible: this.visible,
					editable: this.editable,
					saveIndex: this.saveIndex,
					changed: this.changed,
					type: this.type,
					overlay: this._overlaySaveObj()
				};
			};
			this.contains = function(location){
				switch (this.type) {
					case google.maps.drawing.OverlayType.CIRCLE:
						return this.overlay.getBounds().contains(location) && google.maps.geometry.spherical.computeDistanceBetween(this.overlay.getCenter(),location) <= this.overlay.getRadius();
						break;
					case google.maps.drawing.OverlayType.RECTANGLE:
						return this.overlay.getBounds().contains(location);
						break;
					case google.maps.drawing.OverlayType.POLYGON:
						return google.maps.geometry.poly.containsLocation(location,this.overlay);
						break;
				}
			};

			//------- Initialization -------

			// listen to events
			switch (this.type){
				case google.maps.drawing.OverlayType.CIRCLE:
					google.maps.event.addListener(this.overlay,'radius_changed',this.changeListener);
					google.maps.event.addListener(this.overlay,'center_changed',this.changeListener);
					break;
				case google.maps.drawing.OverlayType.RECTANGLE:
					google.maps.event.addListener(this.overlay,'bounds_changed',this.changeListener);
					break;
				case google.maps.drawing.OverlayType.POLYGON:
					for (var i=0; i<this.overlay.getPaths().getLength(); i++){
						var path = this.overlay.getPaths().getAt(i);
						google.maps.event.addListener(path,'insert_at',this.changeListener);
						google.maps.event.addListener(path,'remove_at',this.changeListener);
						google.maps.event.addListener(path,'set_at',this.changeListener);
					}
					break;
			}

			// Load options
			if (options){
				if (options.name)
					this.name = options.name;
				if (options.map)
					this.map = options.map;
				if (options.editable)
					this.editable = options.editable;
				if (typeof options.color != 'undefined')
					this.color = options.color;
				if (typeof options.visible != 'undefined')
					this.visible = options.visible;
				if (typeof options.saveIndex != 'undefined'){
					this.saveIndex = options.saveIndex;
				}
			}
		}

		Object.defineProperties(Region.prototype,{
			name: {
				get: function(){
					return this._name;
				},
				set: function(v){
					this._name = v;
					this.changeListener();
				}
			},
			map: {
				get: function(){
					return this._map;
				},
				set: function(v){
					this._map = v;
					if (this.overlay)
						this.overlay.setMap(v);
				}
			},
			visible: {
				get: function(){
					return this.overlay && this.overlay.map != null;
				},
				set: function(v){
					this.overlay.setMap(v ? this._map : null);
					this.changeListener();
				}
			},
			color: {
				get: function(){
					if (this.overlay)
						return this.overlay.fillColor;
					else
						return null;
				},
				set: function(v){
					this.overlay.setOptions({fillColor:v});
					this.changeListener();
				}
			},
			editable: {
				get: function(){
					return this.overlay && this.overlay.getEditable();
				},
				set: function(v){
					this.overlay.setEditable(v);
					this.changeListener();
				}
			},
			bounds: {
				get: function(){
					var bounds=null;
					if (this.overlay){
						if (typeof this.overlay.getBounds != 'undefined'){
							bounds = this.overlay.getBounds();
						} else if (typeof this.overlay.getPaths != 'undefined'){
							var outerPath = this.overlay.getPaths().getAt(0);
							for (var i=0; i<outerPath.getLength(); i++){
								if (bounds == null) bounds = new google.maps.LatLngBounds(outerPath.getAt(i));
								else bounds.extend(outerPath.getAt(i));
							}
						} else bounds = new google.maps.LatLngBounds();
					}
					return bounds;
				}
			}
		});

		return Region;
	});
