'use strict';

/**
 * @ngdoc directive
 * @name wardMapApp.directive:openMembershipFile
 * @description
 * # openMembershipFile
 */
angular.module('wardMapApp')
	.directive('openMembershipFile', function (peopleService,Person,Household) {

		var getAge = function(dateString)
		{
			var today = new Date();
			var birthDate = new Date(dateString);
			var age = today.getFullYear() - birthDate.getFullYear();
			var m = today.getMonth() - birthDate.getMonth();
			if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate()))
			{
				age--;
			}
			return age;
		};

		var concatNonEmpty = function(vals){
			var result = '', val;
			for (var i=0; i<vals.length; i++){
				if (typeof vals[i] === 'string'){
					val = vals[i].trim();
					if (val.length > 0){
						if (result.length > 0) result += ' ';
						result += val;
					}
				}
			}
			return result;
		};

		/**
		 * Identifies the fields to use for address information. Note that this is not perfect and should be replaced
		 * with a user-interactive method in the future.
		 * @param fields
		 * @returns {Array}
		 */
		var getAddressFieldNames = function(fields){
			var addressFields=[];
			// Search for "address" fields:
			for (var field in fields){
				if (!field.match(/^(2-|.*mailing)/i) && field.match(/address/i))
					addressFields.push(field);
			}
			if (addressFields.length) return addressFields;
			// No address fields were found, so try to create the address from individual items
			// Search for "street" fields:
			for (var field in fields){
				if (!field.match(/^(2-|.*mailing)/i) && field.match(/street/i))
					addressFields.push(field);
			}
			// Search for city
			for (var field in fields){
				if (!field.match(/^(2-|.*mailing)/i) && field.match(/city/i))
					addressFields.push(field);
			}
			// Search for state
			for (var field in fields){
				if (!field.match(/^(2-|.*mailing)/i) && field.match(/state/i))
					addressFields.push(field);
			}
			// Search for zip
			for (var field in fields){
				if (!field.match(/^(2-|.*mailing)/i) && field.match(/(zip|postal)/i))
					addressFields.push(field);
			}
			// Search for country
			for (var field in fields){
				if (!field.match(/^(2-|.*mailing)/i) && field.match(/country/i))
					addressFields.push(field);
			}
			return addressFields;
		};

		var getAddress = function(fields,addressFieldNames){
			var values = [];
			for (var i=0;i<addressFieldNames.length;i++){
				values.push(fields[addressFieldNames[i]]);
			}
			return concatNonEmpty(values);
		};

		var getNameFields = function(fields,lang){
			var result = [];
			if (typeof fields[lang.preferredName] != 'undefined'){
				result.push(lang.preferredName);
			}
			else {
				// Search for first name field
				for (var field in fields){
					if (field.match(/first.*name/i)){
						result.push(field);
						break;
					}
				}
				if (result.length) {
					// We found a first name, so there is probably a last as well
					for (var field in fields){
						if (field.match(/(last|sur|family).*name/i)){
							result.push(field);
							break;
						}
					}
				}
				if (!result.length){
					// Find the first field with "name" in it.
					for (var field in fields){
						if (field.match(/name/i)){
							result.push(field);
							break;
						}
					}
				}
			}
			return result;
		};

		var getName = function(fields,nameFields){
			var values = [];
			for (var i=0; i<nameFields.length; i++){
				values.push(fields[nameFields[i]]);
			}
			return concatNonEmpty(values);
		};

		var en = {
			//Generic
			address: ['address','Address','ADDRESS'],
			address1: ['address1','Address 1','address 1','ADDRESS1','ADDRESS 1'],
			address2: ['address2','Address 2','address 2','ADDRESS2','ADDRESS 2'],
			address3: ['address3','Address 3','address 3','ADDRESS3','ADDRESS 3'],

			//Membership.csv
			indivId: 'Indiv ID',
			fullName: 'Full Name',
			preferredName: 'Preferred Name',
			headOfHouseId: 'HofH ID',
			householdPosition: 'HH Position',
			householdOrder: 'HH Order',
			householdPhone: 'Household Phone',
			individualPhone: 'Individual Phone',
			householdEmail: 'Household E-mail',
			individualEmail: 'Individual E-mail',
			street1: 'Street 1',
			street2: 'Street 2',
			district: 'D/P',
			city: 'City',
			postal: 'Postal',
			state: 'State/Prov',
			country: 'Country',
			street1_2: '2-Street 1',
			street2_2: '2-Street 2',
			district_2: '2-District or Prefecture',
			city_2: '2-City',
			postal_2: '2-Zip',
			state_2: '2-State or Province',
			country_2: '2-Country',
			wardGeoCode: 'Ward Geo Code',
			stakeGeoCode: 'Stake Geo Code',
			gender: 'Sex',
			dateBorn: 'Birth',
			dateBaptized: 'Baptized',
			dateConfirmed: 'Confirmed',
			dateEndowed: 'Endowed',
			dateRecommendExpiration: 'Rec Exp',
			priesthood: 'Priesthood',
			servedMission: 'Mission',
			isMarried: 'Married',
			spouseIsMember: 'Spouse Member',
			isSealedToSpouse: 'Sealed to Spouse',
			isSealedToPriorSpouse: 'Sealed to Prior',

			headOfHousehold: 'Head of Household',
			spouse: 'Spouse',
			other: 'Other',
			male: 'Male',
			female: 'Female',
			apostle: 'Apostle',
			highPriest: 'High Priest',
			seventy: 'Seventy',
			elder: 'Elder',
			priest: 'Priest',
			teacher: 'Teacher',
			deacon: 'Deacon',
			yes: 'Yes',
			no: 'No',
			notApplicable: 'N/A',
			single: 'Single',
			married: 'Married'
		};

		var csvToArray = function(content){
			var raw = Papa.parse(content,{header: true}), // jshint ignore:line
				households = {},
				lang = en,
				addressFields = getAddressFieldNames(raw.data[0]),
				nameFields = getNameFields(raw.data[0],lang);

			raw = raw.data;

			// TODO: Identify field types
			// boolean, string, date
			// For each field, test/enumerate values - only need to test the first few records

			// Search for known types
			for (var i=0; i<raw.length; i++){
				// Find or create household object
				var householdId = typeof raw[i][lang.headOfHouseId] == 'undefined' ? i : raw[i][lang.headOfHouseId],
					householdObj = null;
				if (households[householdId]){
					householdObj = households[householdId];
				} else {
					var address = getAddress(raw[i],addressFields),
						householdObj = {};
					for (var field in raw[i]){
						// Add household fields, ignoring membership IDs for security
						if (field != lang.headOfHouseId && field != lang.indivId && field.match(/household/i)){
							householdObj[field] = raw[i][field];
						}
					}
					householdObj = new Household(address,householdObj);
					households[householdId] = householdObj;
				}

				// Add person object
				var personObj = {},
					name = getName(raw[i],nameFields);
				for (var field in raw[i]){
					if (field!=lang.headOfHouseId && field!=lang.indivId && (nameFields.indexOf(field)<0) && (addressFields.indexOf(field)<0) && !field.match(/household/i)){
						personObj[field] = raw[i][field];
					}
				}
				var person = new Person(name,householdObj,personObj);

				peopleService.addPerson(person);
			}

			return true;
		};

		return {
			template: '<input type="file" accept="text/csv,text/plain,text/tsv,application/vnd.ms-excel"><script type="text/javascript">$(":file").filestyle({input:false,buttonText:"Load CSV File",badge:false});</script>',
			restrict: 'E',
			link: function postLink(scope, element, attrs) { // jshint ignore:line
				element.on('change',function(e){
					var file = (e.srcElement || e.target).files[0];
					//if (file.type != 'text/csv'){
					//	if (typeof scope.error == 'function') scope.error('File type "'+file.type+'" is not supported. Only csv files may be read.');
					//} else {
						var reader = new FileReader();
						reader.onload = function(e){
							var result = csvToArray(e.target.result);
							if (result === true){
								scope.$apply(function(){
									scope.complete();
								});
							} else {
								scope.$apply(function(){
									scope.error('File data not recognized');
								});
							}
						};
						reader.readAsText((e.srcElement || e.target).files[0]);
					//}
				});
			},
			scope: {
				complete: '=onComplete',
				error: '=onError'
			}
		};
	});
