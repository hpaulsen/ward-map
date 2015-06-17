'use strict';

/**
 * @ngdoc directive
 * @name wardMapApp.directive:openMembershipFile
 * @description
 * # openMembershipFile
 */
angular.module('wardMapApp')
	.directive('openMembershipFile', function (peopleService) {

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

		var concatNonEmpty = function(){
			var result = '', val;
			for (var i=0; i<arguments.length; i++){
				if (typeof arguments[i] === 'string'){
					val = arguments[i].trim();
					if (val.length > 0){
						if (result.length > 0) result += ' ';
						result += val;
					}
				}
			}
			return result;
		};

		var en = {
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
				individuals = [],
				households = {},
				lang = en;

			raw = raw.data;

			// Search for known types
			for (var i=0; i<raw.length; i++){
				var household = typeof raw[i][lang.headOfHouseId] == 'undefined' ? i : raw[i][lang.headOfHouseId],
					age = getAge(raw[i][lang.dateBorn]),
					yearsMember = (raw[i][lang.dateConfirmed] == '') ? null : getAge(raw[i][lang.dateConfirmed]),
					memberSinceAge = yearsMember ? age-yearsMember : null,
					yearsEndowed = (raw[i][lang.dateEndowed] == '') ? null : getAge(raw[i][lang.dateEndowed]),
					currentRecommend = (raw[i][lang.dateRecommendExpiration] == '') ? null : getAge(raw[i][lang.dateRecommendExpiration]) < 0,
					married = raw[i][lang.isMarried] == lang.married,
					spouseMember = married ? raw[i][lang.spouseIsMember] == lang.yes : null,
					sealedToSpouse = married ? raw[i][lang.isSealedToSpouse] == lang.yes : null,
					hhObj = {
						id: household,
						address1: concatNonEmpty(
							raw[i][lang.street1],
							raw[i][lang.street2],
							raw[i][lang.district],
							raw[i][lang.city],
							raw[i][lang.state],
							raw[i][lang.postal]
						),
						address2: concatNonEmpty(
							raw[i][lang.street1_2],
							raw[i][lang.street2_2],
							raw[i][lang.district_2],
							raw[i][lang.city_2],
							raw[i][lang.state_2],
							raw[i][lang.postal_2]
						),
						phone: raw[i][lang.householdPhone],
						email: raw[i][lang.householdEmail]
					},
					indivObj = {
						householdId: household,
						name: raw[i][lang.preferredName],
						phone: raw[i][lang.individualPhone],
						email: raw[i][lang.individualEmail],
						position: raw[i][lang.householdPosition],
						gender: raw[i][lang.gender],
						age: age,
						yearsMember: yearsMember,
						memberSinceAge: memberSinceAge,
						yearsEndowed: yearsEndowed,
						currentRecommend: currentRecommend,
						priesthood: raw[i][lang.priesthood],
						mission: raw[i][lang.servedMission] == lang.yes,
						married: married,
						spouseMember: spouseMember,
						sealedToSpouse: sealedToSpouse
					};
				if (!households[household]){households[household] = hhObj;}
				individuals.push(indivObj);
				peopleService.addPerson(indivObj,hhObj);
			}

			return true;
			//{
			//	households: households,
			//	individuals: individuals
			//};
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
