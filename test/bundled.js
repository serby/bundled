describe('bundled', function() {

  it('should expose createBundled', function() {
    require('..').createBundled.should.be.a('function');
  });

});