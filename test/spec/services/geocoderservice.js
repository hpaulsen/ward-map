'use strict';

describe('Service: geocoderService', function () {

  // load the service's module
  beforeEach(module('wardMapApp'));

  // instantiate service
  var geocoderService;
  beforeEach(inject(function (_geocoderService_) {
    geocoderService = _geocoderService_;
  }));

  it('should do something', function () {
    expect(!!geocoderService).toBe(true);
  });

});
