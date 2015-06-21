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
		var people = [], // simple array of all people
			markers = {}, // 3d markers array indexed by lat->lng
			householdDetail = {}, // household data, indexed by household id
			householdMembers = {}, // array of household member indices, indexed by household id
			filters = []; // array of {field: "fieldName", include: "singleValue"|["value1","value2"], exclude:"singleValue"|["value1","value2"]}

		this.people = []; // filtered
		this.households = []; // filtered

		this.addPerson = function(person){
			people.push(person);
			if (this.personMatchesFilter(person)) this.people.push(person);
			if (this.households.indexOf(person.household)<0) this.households.push(person.household);
		};

		this.findMarker = function(latitude,longitude){
			var latStr = latitude.toFixed(8),
				lngStr = longitude.toFixed(8);
			if (typeof markers[latStr] == 'undefined') return false;
			else if (typeof markers[latStr][lngStr] == 'undefined') return false;
			else return markers[latStr][lngStr];
		};

		this.addMarker = function(marker){
			var pos = marker.marker.getPosition(),
				lat = pos.lat().toFixed(8),
				lng = pos.lng().toFixed(8);
			if (typeof markers[lat] == 'undefined') {
				markers[lat] = {};
				markers[lat][lng] = marker;
			} else if (typeof markers[lat][lng] == 'undefined') {
				markers[lat][lng] = marker;
			} else {
				throw 'Marker already exists!'
			}
		};

		//this.getHouseholdDetail = function(id){
		//	return householdDetail[id];
		//};

		//this.getHouseholdMembers = function(id){
		//	return householdMembers[id];
		//};

		this.addFilter = function(field, mustBe, mustNotBe){
			filters.push({
				field: field,
				include: mustBe,
				exclude: mustNotBe
			});
		};

		this.clearFilters = function(){
			filters.splice(0,filters.length);
		};

		this.personMatchesFilter = function(person){
			var result = true;
			//for (var i=0; i<filters.length; i++){
			//	if (typeof person[filters[i].field] !== undefined){
			//		if (typeof filters[i].include !== undefined && filters[i]){
			//
			//		}
			//	}
			//}
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


