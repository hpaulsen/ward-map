'use strict';

/**
 * @ngdoc service
 * @name wardMapApp.peopleService
 * @description
 * # peopleService
 * Service in the wardMapApp.
 */
angular.module('wardMapApp')
	.service('peopleService', function peopleService() {
		var people = [], // simple array of people
			householdDetail = {}, // household data, indexed by household id
			householdMembers = {}, // array of household member indices, indexed by household id
			householdLocations = {}, // three-dimensional array, indexed by latitude=>longitude=>householdId
			filters = []; // array of {field: "fieldName", include: "singleValue"|["value1","value2"], exclude:"singleValue"|["value1","value2"]}

		this.people = []; // filtered
		this.households = []; // filtered

		this.addPerson = function(person,household){
			if (!householdDetail[household.id]) {
				householdDetail[household.id] = household;
				householdMembers[household.id] = [];
				if (person.position == 'Head of Household') householdDetail[household.id].name = person.name;
			} else {
				if (person.position == 'Spouse'){
					var headParts = householdDetail[household.id].name.split(','),
						spouseParts = person.name.split(',');
					if (headParts[0] == spouseParts[0]){
						householdDetail[household.id].name = headParts[0]+','+headParts[1]+' &'+spouseParts[1];
					} else {
						householdDetail[household.id].name += ' & '+person.name;
					}
				}
			}
			var i = people.push(person);
			householdMembers[household.id].push(i);
			if (this.personMatchesFilter(person)){
				this.people.push(person);
				if (this.households.length < 1 || this.households[this.households.length-1].id != household.id){
					this.households.push(householdDetail[household.id]);
				}
				//if (typeof this.households[person.household] == 'undefined'){
				//	this.households[person.household] = household;
				//}
			}
		};

		this.addFilter = function(field, mustBe, mustNotBe){
			filters.push({
				field: field,
				include: mustBe,
				exclude: mustNotBe
			});
		};

		this.clearFilters = function(){
			filters.splice(0,filters.length);
		}

		this.personMatchesFilter = function(person){
			var result = true;
			for (var i=0; i<filters.length; i++){
				if (typeof person[filters[i].field] !== undefined){
					if (typeof filters[i].include !== undefined && filters[i]){

					}
				}
			}
			return result;
		};
	});

/**
 *
 * Filters:
 * - Priesthood
 * -- office
 * -- current/not
 * - With/out children
 * -- with/out children by age
 * - Single/married
 * - Temple recommend
 * - Sealed
 * - Part Member
 *
 * Infants
 * Nursery
 * Primary
 * Children (Nursery+Primary+Infants)
 * YM
 * YW
 * Youth (YM+YW)
 * Relief Society
 * Priesthood
 * - Aaronic (current/past due)
 * - Melchizedek (current/prospective elders)
 * Recent Converts
 * Young Single Adults
 * Single Adults
 * Single parents
 * - Single mothers
 * - Single fathers
 */


