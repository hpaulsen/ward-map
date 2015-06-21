'use strict';

describe('Service: Marker', function () {

  // load the service's module
  beforeEach(module('wardMapApp'));

  // instantiate service
  var Marker;
  beforeEach(inject(function (_Marker_) {
    Marker = _Marker_;
  }));

  it('should do something', function () {
    expect(!!Marker).toBe(true);
  });

});
