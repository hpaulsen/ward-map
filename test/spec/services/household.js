'use strict';

describe('Service: Household', function () {

  // load the service's module
  beforeEach(module('wardMapApp'));

  // instantiate service
  var Household;
  beforeEach(inject(function (_Household_) {
    Household = _Household_;
  }));

  it('should do something', function () {
    expect(!!Household).toBe(true);
  });

});
