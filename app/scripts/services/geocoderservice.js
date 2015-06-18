/*
 * An AngularJS Service for intelligently geocoding addresses using Google's API. Makes use of
 * localStorage (via the ngStorage package) to avoid unnecessary trips to the server. Queries
 * Google's API synchronously to avoid `google.maps.GeocoderStatus.OVER_QUERY_LIMIT`.
 *
 * @author: benmj
 * @author: amir.valiani
 * @author: hpaulsen
 *
 * Original source: https://gist.github.com/benmj/6380466
 */

/*global angular: true, google: true, _ : true */

'use strict';

/**
 * @ngdoc service
 * @name wardMapApp.geocoderService
 * @description
 * # geocoderService
 * Service in the wardMapApp.
 */
angular.module('wardMapApp')
	.service('geocoderService', function geocoderService($localStorage,$q,$timeout,$rootScope) {

		/**
		 * Local Address Cache Object
		 *
		 * The goal of LocalCache is to shrink the size of the geocoded address objects as much as
		 * possible to reduce the footprint of very large datasets.
		 *
		 * Each geocoded object is expected to have the following properties:
		 * <ul>
		 *     <li>types {array} (corresponding to google's types)</li>
		 *     <li>latitude {number}</li>
		 *     <li>longitude {number}</li>
		 *     <li>address {string}</li>
		 * </ul>
		 *
		 * @returns {{getLocalLocation: Function, setLocalLocation: Function, refreshLocalLocation: Function, purgeLocalLocation: Function, purgeLocalLocations: Function}}
		 * @constructor
		 */
		var LocalCache = function(){
			var VERSION = '1.0.2';

			// Check version of $localStorage.locations
			if ($localStorage.locationsVersion !== VERSION){
				if ($localStorage.locationsVersion === '1.0.1'){
					for (var i in $localStorage.locations){
						$localStorage.locations[i].p = false;
					}
					$localStorage.locationsVersion = '1.0.2';
				} else {
					delete $localStorage.locations;
					delete $localStorage.locationsTypes;
					$localStorage.locationsVersion = VERSION;
					$localStorage.locations = {};
					$localStorage.locationsTypes = [];
				}
			}

			//var locations = $localStorage.locations ? JSON.parse($localStorage.locations) : {};

			/**
			 * An array of the types that google has returned. Keeping these types here allows us to
			 * store the values for each address as a bitmask.
			 * @type {Array}
			 */
			var types = $localStorage.locationsTypes;// ? JSON.parse($localStorage.locationsTypes) : [];

			/**
			 * Create an array of bitmasks
			 * @type {Array}
			 */
			var typeMasks = [];
			var mask = 1;
			for (var i=0; i<32; i++){
				typeMasks.push(mask);
				mask << 1;
			}

			/**
			 * Convert a typemask into an array of type strings
			 * @param typeMask
			 * @returns {Array} An array of type strings
			 */
			var getTypes = function(typeMask){
				var result = [];
				for (var i=0; i<types.length; i++){
					if (typeMask | typeMasks[i])
						result.push(types[i]);
				}
				return result;
			}

			/**
			 * Convert an array of type strings into a typemask (adding new types as needed)
			 * @param addressTypes
			 * @returns {number}
			 */
			var getMask = function(addressTypes){
				var result = 0;
				for (var type in addressTypes){
					var i = _.indexOf(types,type);
					if (i<0) {
						i = types.push(type)-1; // only valid for densely packed arrays
						$localStorage.locationsTypes = types; // redundant? Is this tracked?
					}
					result = result | typeMasks[i];
				}
				return result;
			}

			return {
				/**
				 * Attempts to retrieve a geocoded address from the cache
				 * @param address
				 * @param id
				 * @returns {*} false if no local address found, or an address object otherwise
				 */
				getLocalLocation: function(address, id){
					if (typeof $localStorage.locations[address] == 'undefined') return false;
					var raw = $localStorage.locations[address],
						types = getTypes(raw.t);
					return {
						types: raw.t,
						latitude: raw.a,
						longitude: raw.o,
						formattedAddress: raw.d,
						partial: raw.p,
						id: id
					}
				},
				/**
				 * Adds a geocoded address to the cache
				 * @param address
				 * @param data {{type:Array,latitude:Number,longitude:Number,formattedAddress:String}}
				 */
				setLocalLocation: function(address, data){
					if (_.isUndefined(data.types) || _.isUndefined(data.latitude) || _.isUndefined(data.longitude) || _.isUndefined(data.formattedAddress)){
						console.log(data);
						throw "Malformed geocode data. Expected {type, latitude, longitude, formattedAddress}";
					}
					$localStorage.locations[address] = {
						t: data.types,
						a: data.latitude,
						o: data.longitude,
						p: typeof data.partial == 'undefined' ? false : data.partial,
						d: data.formattedAddress
					};
				},
				///**
				// * Replace a
				// * @param address
				// * @param id
				// * @returns A promise object
				// */
				//refreshLocalLocation: function(address, id){
				//	if (typeof $localStorage.locations[address] != 'undefined')
				//		delete $localStorage.locations[address];
				//	return addToQueue(address, id);
				//},
				/**
				 * Remove a single address from the local storage
				 * @param address
				 */
				purgeLocalLocation: function(address){
					if (typeof $localStorage.locations[address] != 'undefined')
						delete $localStorage.locations[address];
				},
				/**
				 * Empty all local storage objects except the version number
				 */
				purgeLocalLocations: function(){
					//delete $localStorage.locations;
					//delete $localStorage.locationsType;
					$localStorage.locations = {};
					$localStorage.locationsType = [];
				}
			}
		}

		var localCache = LocalCache();

		//--------------------------------------------------------------------------------
		// Geocoding
		//--------------------------------------------------------------------------------

		var queue = [],

		/**
		 * Amount of time (in milliseconds) to pause between each trip to the
		 * Geocoding API, which places limits on frequency.
		 * @type {number}
		 */
			QUERY_PAUSE = 200,
			CURRENT_PAUSE = QUERY_PAUSE,
			MAX_PAUSE = 2000, // 2-second pause and still problems probably means we're over 24-hour limit

		/**
		 * Amount of time (in milliseconds) to pause between each trip to the
		 * local storage, avoiding the "long script" warnings in some browsers
		 * @type {number}
		 */
			LOCAL_PAUSE = 10,

			geocoder = new google.maps.Geocoder(),

			processing = false;

		/**
		 * Add an object to the processing queue
		 * @param address The address string to geocode
		 * @param id An arbitrary id
		 * @returns A promise object
		 */
		var addToQueue = function(address, id){
			var d = $q.defer();

			queue.push({
				address: address,
				id: id,
				d: d
			});

			if (!processing) {
				processing = true;
				CURRENT_PAUSE = QUERY_PAUSE;
				executeNext();
			}

			return d.promise;
		};

		/**
		 * executeNext() - execute the next function in the queue.
		 * If a result is returned, fulfill the promise.
		 * If we get an error, reject the promise (with message).
		 * If we receive OVER_QUERY_LIMIT, increase interval and try again.
		 */
		var executeNext = function () {
			var task = queue.shift();

			var result = localCache.getLocalLocation(task.address,task.id);

			if (result !== false){
				task.d.resolve(result);
				if (queue.length){
					$timeout(executeNext, LOCAL_PAUSE);
				} else {
					processing = false;
				}
			} else {
				geocoder.geocode({address: task.address},function(result,status){
					if (status === google.maps.GeocoderStatus.OK){
						var parsedResult = {
							types: result[0].types,
							latitude: result[0].geometry.location.lat(),
							longitude: result[0].geometry.location.lng(),
							formattedAddress: result[0].formatted_address,
							partial: result[0].partial_match
						};
						localCache.setLocalLocation(task.address,parsedResult);
						parsedResult.id = task.id;
						task.d.resolve(parsedResult);
					} else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
						task.d.reject({
							type: 'zero',
							id: task.id,
							message: 'Zero results for geocoding address ' + task.address
						});
					} else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
						queue.unshift(task); // add it back in to try again
						if (CURRENT_PAUSE >= MAX_PAUSE) {
							task.d.reject({
								type: 'limit',
								id: task.id,
								message: 'It seems that the 24-hour geocoding limit has been reached. Try again after 24 hours.'
							});
						} else {
							CURRENT_PAUSE += 100; // add another tenth of a second to the pause between queries
						}
					} else if (status === google.maps.GeocoderStatus.REQUEST_DENIED) {
						task.d.reject({
							type: 'denied',
							id: task.id,
							message: 'Request denied for geocoding address ' + task.address
						});
					} else {
						task.d.reject({
							type: 'invalid',
							id: task.id,
							message: 'Invalid request for geocoding: status=' + status + ', address=' + task.address
						});
					}

					if (queue.length) {
						$timeout(executeNext, CURRENT_PAUSE);
					} else {
						processing = false;
					}
				});
			}

			if (!$rootScope.$$phase) {
				$rootScope.$apply();
			}
		};

		return {
			geocodeAddress: function (address, id) {
				return addToQueue(address,id);
			},

			refresh: function(address, id){
				localCache.purgeLocalLocation(address);
				return addToQueue(address,id);
			},

			purge: function(){
				localCache.purgeLocalLocations();
			},

			manual: function(address, latitude, longitude){
				var obj = {
					type: ['manual'],
					latitude: latitude,
					longitude: longitude,
					formattedAddress: address
				}
				localCache.setLocalLocation(address, obj);
				return obj;
			}
		};
	});
