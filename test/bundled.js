var logger = {}
logger.warn = logger.info = function() {}

function validThree(app) {
  return require('..')(app, { logger: logger, strictDependencyChecking: true })
    .addPath(__dirname + '/fixtures/hoozit')
    .addPath(__dirname + '/fixtures/woozit')
    .addPath(__dirname + '/fixtures/doodad')
}

describe('bundled', function() {

  it('should be a function', function() {
    require('..').should.be.a('function')
  })

  describe('#addPath()', function() {

    it('should error with no path', function() {
      var bundled = require('..');
      (function() {
        bundled().addPath()
      }).should.throwError('Unable to find bundle: undefined')
    })

    it('should error with invalid path', function() {
      var bundled = require('..');
      (function() {
        bundled().addPath(__dirname + '/fixtures/DOESNOTEXIST')
      }).should.throwError(/Unable to find bundle:/)
    })

    it('should error if no bundle.js is found in a valid path', function() {
      var bundled = require('..');
      (function() {
        bundled().addPath(__dirname + '/fixtures/invalid')
      }).should.throwError(/Unable to find bundle config/)
    })

    it('should error if bundle does not have a name', function() {
      var bundled = require('..');
      (function() {
        bundled().addPath(__dirname + '/fixtures/no-name')
      }).should.throwError(/Bundle is missing a name/)
    })

    it('should error if bundle does not have a version number', function() {
      var bundled = require('..');
      (function() {
        bundled().addPath(__dirname + '/fixtures/no-version')
      }).should.throwError('Bundle \'No Version\' is missing a version')
    })

    it('should work with a valid bundle', function() {
      var bundled = require('..');
      bundled({}, { logger: logger }).addPath(__dirname + '/fixtures/hoozit')
    })


    it('should error if a dependency is not met and strict checking is on', function() {
      var bundled = require('..');
      (function() {

        bundled({}, { logger: logger, strictDependencyChecking: true })
          .addPath(__dirname + '/fixtures/woozit')

      }).should.throwError(/Dependencies for 'Woozit' were not met/)
    })

    it('should not error if a dependency is not met and but strict checking is off', function() {
      var bundled = require('..');
      bundled({}, { logger: logger })
        .addPath(__dirname + '/fixtures/woozit')
    })

    it('should not error a dependency is met and strict checking is on', function() {
      var bundled = require('..');
      bundled({}, { logger: logger, strictDependencyChecking: true })
        .addPath(__dirname + '/fixtures/hoozit')
        .addPath(__dirname + '/fixtures/woozit')
    })
  })

  describe('#initialize()', function() {
    it('should call initialize on bundles that have them', function(done) {
      var bundled = require('..')
        , app = { order: [] }
      bundled(app, { logger: logger, strictDependencyChecking: true })
        .addPath(__dirname + '/fixtures/hoozit')
        .addPath(__dirname + '/fixtures/woozit')
        .initialize(function() {
          app.hoozit.initialized.should.equal(true)
          done()
        })
    })

    it('should call every initialize in the correct order on bundles that have many', function(done) {
      var app = { order: [] }
      validThree(app).initialize(function() {
        app.woozit.length.should.equal(2)
        app.order.should.eql([ 'hoozit', 'woozit 1', 'doodad 1', 'woozit 2', 'doodad 2' ])
        done()
      })
    })


    it('should allow initialize functions without a callback', function() {

      var app = { }
      , notAsync = require('..')(app, { logger: logger, strictDependencyChecking: true })
        .addPath(__dirname + '/fixtures/not-async')

      notAsync.initialize()
      app.notAsync.should.equal(1)

    })

  })

  describe('#get()', function() {
    it('should get an array of all the properties from the bundles', function() {
      var app = { order: [] }
      validThree(app)
        .get('name').should.eql([ 'Hoozit', 'Woozit', 'Doodad' ] )
    })

    it('should flatten array of all the properties from the bundles', function() {
      var app = { order: [] }
      validThree(app)
        .get('nav').should.eql([ 'main hoozit',
          'second hoozit',
          'main woozit',
          'second woozit',
          'doodad' ])
    })

    it('should use compare function', function() {
      var app = { order: [] }
      function compare(value, bundle) {
        return bundle.name === 'Woozit'
      }
      validThree(app)
        .get('nav', compare).should.eql([ 'main woozit', 'second woozit' ])
    })
  })
  describe('#forEach()', function() {

    it('should loop through all properties synchronously', function() {
      var app = { order: [] }
      var i = 0
      validThree(app).forEach('nav', function () {
        i++
      })
      i.should.equal(5)
    })

    it('should loop through all properties asynchronously', function() {
      var app = { order: [] }
      var i = 0
      validThree(app).forEach('nav', function(item, bundle, done) {
        i++
        done()
      }, function () {
        i.should.equal(5)
      })
    })
  })
})