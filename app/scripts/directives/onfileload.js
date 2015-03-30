'use strict';

/**
 * @ngdoc directive
 * @name wardMapApp.directive:onFileLoad
 * @description
 * # onFileLoad
 */
angular.module('wardMapApp')
	.directive('onFileLoad', function (peopleService) {

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

		var csvToArray = function(content,delimiter){
			var raw = Papa.parse(content,{header: true}), // jshint ignore:line
				individuals = [],
				households = {};

			raw = raw.data;

			// Search for known types
			for (var i=0; i<raw.length; i++){
				var household = typeof raw[i]['HofH ID'] == 'undefined' ? i : raw[i]['HofH ID'],
					age = getAge(raw[i]['Birth']),
					yearsMember = (raw[i]['Confirmed'] == '') ? null : getAge(raw[i]['Confirmed']),
					memberSinceAge = yearsMember ? age-yearsMember : null,
					yearsEndowed = (raw[i]['Endowed'] == '') ? null : getAge(raw[i]['Endowed']),
					currentRecommend = (raw[i]['Rec Exp'] == '') ? null : getAge(raw[i]['Rec Exp']) < 0,
					married = raw[i]['Married'] == 'Married',
					spouseMember = married ? raw[i]['Spouse Member'] == 'Yes' : null,
					sealedToSpouse = married ? raw[i]['Sealed to Spouse'] == 'Yes' : null,
					hhObj = {
						id: household,
						address1: concatNonEmpty(raw[i]['Street 1'],raw[i]['Street 2'],raw[i]['City'],raw[i]['State'],raw[i]['State/Prov'],raw[i]['Postal']),
						address2: concatNonEmpty(raw[i]['2-Street 1'],raw[i]['2-Street 2'],raw[i]['2-City'],raw[i]['2-State'],raw[i]['2-State/Prov'],raw[i]['2-Postal']),
						phone: raw[i]['Household Phone'],
						email: raw[i]['Household E-mail']
					},
					indivObj = {
						householdId: household,
						name: raw[i]['Preferred Name'],
						phone: raw[i]['Individual Phone'],
						email: raw[i]['Individual E-mail'],
						position: raw[i]['HH Position'],
						gender: raw[i]['Sex'],
						age: age,
						yearsMember: yearsMember,
						memberSinceAge: memberSinceAge,
						yearsEndowed: yearsEndowed,
						currentRecommend: currentRecommend,
						priesthood: raw[i]['Priesthood'],
						mission: raw[i]['Mission'] == 'Yes',
						married: married,
						spouseMember: spouseMember,
						sealedToSpouse: sealedToSpouse
					};
				if (!households[household]){households[household] = hhObj;}
				individuals.push(indivObj);
				peopleService.addPerson(indivObj,hhObj);
			}

			return {
				households: households,
				individuals: individuals
			};
		};

		return {
			template: '<input type="file">',
			restrict: 'E',
			link: function postLink(scope, element, attrs) { // jshint ignore:line
				element.on('change',function(e){
					var reader = new FileReader();
					reader.onload = function(e){
						csvToArray(e.target.result);
						scope.$apply(function(){
							scope.complete();
						});
					};
					reader.readAsText((e.srcElement || e.target).files[0]);
				});
			},
			scope: {
				complete: '=onComplete'
			}
		};
	});
