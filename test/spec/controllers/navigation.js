'use strict';

describe('Controller: NavigationCtrl', function () {

	// load the controller's module
	beforeEach(module('wardMapApp'));

	var NavigationCtrl,
		scope,
		location;

	// Initialize the controller and a mock scope
	beforeEach(inject(function ($location, $controller, $rootScope) {
		location = $location;
		scope = $rootScope.$new();
		NavigationCtrl = $controller('NavigationCtrl', {
			$scope: scope
		});
	}));

	it('should show if location is selected', function () {
		location.path('/somepath');
		expect(scope.isActive('/somepath')).toBe(true);
		expect(scope.isActive('/someotherpath')).toBe(false);
	});
});
