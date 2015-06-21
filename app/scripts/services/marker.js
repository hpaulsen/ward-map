'use strict';

/**
 * @ngdoc service
 * @name wardMapApp.Marker
 * @description
 * # Marker
 * Factory in the wardMapApp.
 */
angular.module('wardMapApp')
	.factory('Marker', function ($rootScope) {

		var map = $rootScope.map.control.getGMap();

		function Marker(lat,lng,icon,fields){
			this.lat = lat;
			this.lng = lng;
			this.icon = icon;
			this.marker = new google.maps.Marker({position:new google.maps.LatLng(lat,lng),icon:icon,map:map});
			var $this = this;
			google.maps.event.addListener(this.marker,'click',function(a){$this._click(a);});
			this.households = [];

			for (var field in fields){
				if (field != 'lat' && field != 'lng' && field != 'icon' && field != 'marker' && field != 'households' && field != 'addHousehold')
					this[field] = fields[field];
			}
		}

		Marker.prototype._click = function(a){
			console.log(this);
		};

		Marker.prototype.getVisible = function(){
			return this.marker.getVisible();
		};

		Marker.prototype.setVisible = function(value,propagate){
			this.marker.setVisible(value);
			if (propagate){
				for (var i=0; i<this.households.length; i++){
					this.households.setVisible(value,true);
				}
			}
		};

		Marker.prototype.addHousehold = function(household){
			if (this.households.indexOf(household) == -1){
				this.households.push(household);
				if (this.households.length > 1){
					var title = this.households.length+' households: '+this.households[0].name;
					for (var i=1; i<this.households.length; i++){
						title += '; '+this.households[i].name;
					}
					this.marker.setTitle(title);
				}
				else if (this.households.length == 1)
					this.marker.setTitle(this.households[0].name);
				else
					this.marker.setTitle('No households');
			}
			if (household.marker != this)
				household.marker = this;
		};

		return Marker;
	});
