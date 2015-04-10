'use strict';

/**
 * @ngdoc service
 * @name wardMapApp.Region
 * @description
 * # Region
 * Factory in the wardMapApp.
 */
angular.module('wardMapApp')
	.factory('Region', function ($localStorage) {
		// Constructor

		function Region(type,overlay,options){

			//------- Private -------
			var $this = this,
				changeListener = function(){
					save();
				},
				save = function(){
					console.log($this);
				};

			this._map = null;
			this._saveIndex = -1;

			//------- Public properties -------
			this.type = type;
			this.overlay = overlay;
			this.name = 'untitled'; // placeholder

			//------- Public methods -------
			this.zoom = function(){
				this._map.fitBounds(this.bounds);
			};

			//------- Initialization -------

			// listen to events
			switch (this.type){
				case google.maps.drawing.OverlayType.CIRCLE:
					google.maps.event.addListener(this.overlay,'radius_changed',changeListener);
					google.maps.event.addListener(this.overlay,'center_changed',changeListener);
					break;
				case google.maps.drawing.OverlayType.RECTANGLE:
					google.maps.event.addListener(this.overlay,'bounds_changed',changeListener);
					break;
				case google.maps.drawing.OverlayType.POLYGON:
					for (var i=0; i<this.overlay.getPaths().getLength(); i++){
						var path = this.overlay.getPaths().getAt(i);
						google.maps.event.addListener(path,'insert_at',changeListener);
						google.maps.event.addListener(path,'remove_at',changeListener);
						google.maps.event.addListener(path,'set_at',changeListener);
					}
					break;
			}

			// Load options
			if (typeof options != 'undefined'){
				if (typeof options.name != 'undefined')
					this.name = options.name;
				if (typeof options.color != 'undefined')
					this.color = options.color;
				if (typeof options.visible)
					this.visible = options.visible;
			}
		}

		Object.defineProperties(Region.prototype,{
			map: {
				get: function(){
					return this._map;
				},
				set: function(v){
					this._map = v;
					this.overlay.setMap(v);
				}
			},
			visible: {
				get: function(){
					return this.overlay.map != null;
				},
				set: function(v){
					this.overlay.setMap(v ? this._map : null);
				}
			},
			color: {
				get: function(){
					return this.overlay.fillColor;
				},
				set: function(v){
					this.overlay.setOptions({fillColor:v});
				}
			},
			editable: {
				get: function(){
					return this.overlay.getEditable();
				},
				set: function(v){
					this.overlay.setEditable(v);
				}
			},
			bounds: {
				get: function(){
					var bounds=null;
					if (typeof this.overlay.getBounds != 'undefined'){
						bounds = this.overlay.getBounds();
					} else if (typeof this.overlay.getPaths != 'undefined'){
						var outerPath = this.overlay.getPaths().getAt(0);
						for (var i=0; i<outerPath.getLength(); i++){
							if (bounds == null) bounds = new google.maps.LatLngBounds(outerPath.getAt(i));
							else bounds.extend(outerPath.getAt(i));
						}
					} else bounds = new google.maps.LatLngBounds();
					return bounds;
				}
			}
		});

		return Region;
	});
