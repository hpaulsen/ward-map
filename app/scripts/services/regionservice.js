'use strict';

angular.module('wardMapApp')
	.service('regionService',function($localStorage,Region){

		this.regions = [];

		this.getRegions = function(){ return this.regions; };

		this.clear = function(){
			regions.length = 0;
		};

		this.drawingManager = null;

		this.setDrawingManager = function(drawingManager){
			this.drawingManager = drawingManager;
		};

		this.setEditable = function(v){
			for (var i=0; i<this.regions.length; i++){
				this.regions[i].overlay.setEditable(v);
			}
		};

		this.delete = function(region){
			var i = this.regions.indexOf(region);
			if (i > -1){
				this.regions.splice(i,1);
				$localStorage.regions.splice(i,1);
			}
			region.map = null;
		};

		this.add = function(type,overlay,options){
			options.type = type;
			options.overlay = overlay;
			var region = new Region(options),
				index = this.regions.push(region)-1;
			this.saveRegion(region);
			return index;
		};

		var change = function(region){
			$localStorage.regions[region.saveIndex] = region.toSaveObj();
		};

		// Load from local storage
		var VERSION = '1.0.3';
		if ($localStorage.regionsVersion !== VERSION){
			// This should be replaced with migration options
			delete $localStorage.regions;
			$localStorage.regions = [];
			$localStorage.regionsVersion = VERSION;
		}

		if ($localStorage.regions.length){
			for (var i=0; i<$localStorage.regions.length; i++){
				var regionOptions = $localStorage.regions[i];
				regionOptions.saveIndex = i;
				regionOptions.change = change;
				this.regions.push(new Region(regionOptions));
				//var options = {
				//	saveIndex: i
				//};
				//this.regions.push(new Region(options));
			}
		}

		this.saveRegion = function(region){
			$localStorage.regions.push(region.toSaveObj());
			//var obj = {
			//	saveIndex: this.regions.indexOf(region),
			//};
			//$localStorage.regions.push(obj);
		};

	});
