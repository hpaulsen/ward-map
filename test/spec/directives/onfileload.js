'use strict';

describe('Directive: openMembershipFile', function () {

  // load the directive's module
  beforeEach(module('wardMapApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<on-file-load></on-file-load>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the openMembershipFile directive');
  }));
});
