'use strict';

/**
 * @ngdoc service
 * @name wardMapApp.Person
 * @description
 * # Person
 * Factory in the wardMapApp.
 */
angular.module('wardMapApp')
	.factory('Person', function () {

		function Person(name,household,fields){
			this.name = name;
			this.visible = true;
			this.setHousehold(household);
			for (var field in fields){
				if (field != 'name' && field != 'setHousehold')
					this[field] = fields[field];
			}
		}

		Person.prototype.setVisible = function(value){
			this.visible = value;
			if (this.household){
				var householdVisible = false;
				for (var i=0; i<this.household.people.length; i++){
					if (this.household.people[i].visible){
						householdVisible = true;
						break;
					}
				}
				if (this.household.visible != householdVisible)
					this.household.setVisible(householdVisible,false);
			}
		};

		Person.prototype.setHousehold = function(household){
			this.household = household;
			this.household.addPerson(this);
		};

		return Person;
	});
