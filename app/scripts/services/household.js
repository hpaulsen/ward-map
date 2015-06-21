'use strict';

/**
 * @ngdoc service
 * @name wardMapApp.Household
 * @description
 * # Household
 * Factory in the wardMapApp.
 */
angular.module('wardMapApp')
	.factory('Household', function ($rootScope) {

		function Household(address,fields){
			this.marker = null;
			this.address = address;
			this.formattedAddress = address;
			this.geocodeApproximate = true;
			this.people = [];
			this.visible = true;
			this.name = 'Household';
			for (var field in fields){
				if (field != 'marker' && field != 'people' && field != 'setMarker' && field != 'addPerson')
					this[field] = fields[field];
			}
		}

		Household.prototype.setVisible = function(value,propagate){
			this.visible = value;
			if (propagate){
				for (var i=0; i<this.people.length; i++){
					this.people[i].setVisible(value);
				}
			}
			if (this.marker){
				var markerVisible = false;
				for (var i=0; i<this.marker.households.length; i++){
					if (this.marker.households[i].visible){
						markerVisible = true;
						break;
					}
				}
				if (markerVisible != this.marker.getVisible()){
					this.marker.setVisible(markerVisible,false);
				}
			}
		};

		Household.prototype.setMarker = function(marker){
			// Note: remove from previous marker if shuffling around is desired
			this.marker = marker;
			this.marker.addHousehold(this);
		};

		Household.prototype.addPerson = function(person){
			if (this.people.indexOf(person) == -1){
				this.people.push(person);
				if (this.people.length == 1) this.name = person.name;
			}
			if (person.household != this)
				person.household = this;
		};

		return Household;
	});
