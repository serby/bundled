var _ = require('lodash')
  , async = require('async')
  , semver = require('semver')
  , path = require('path')
  , fs = require('fs')
  , existsSync

existsSync = fs.existsSync || path.existsSync

module.exports = function(app, options) {

  var self = {}
    , bundles = {}

  options = _.extend({
    bundleConfig: 'bundle.js',
    logger: console,
    strictDependencyChecking: false
  }, options)


  /**
   * Check a single dependencies by name and version
   *
   * @param {Object} bundle The Bundle to check
   * @return {Boolean} True a bundle exists with that version
   */
  function checkDependancy(name, version) {

    if (bundles.hasOwnProperty(name)) {
      return semver.satisfies(bundles[name].version, version)
    }
    return false
  }

  /**
   * Check this bundles dependencies are met
   *
   * @param {Object} bundle The Bundle to check
   * @return {Boolean} True if all the dependencies are met
   */
  function checkDependancies(bundle) {
    var dependenciesFound = true
    if (bundle.hasOwnProperty('dependencies') && typeof bundle.dependencies === 'object') {
      Object.keys(bundle.dependencies).forEach(function(name) {
        if (!checkDependancy(name, bundle.dependencies[name])) {
          options.logger.warn('Unable to find dependencies for \'' + bundle.name +
            '\' that matches \'' + name + '@' + bundle.dependencies[name])
          dependenciesFound = false
        }
      })
    }
    return dependenciesFound
  }

  /**
   * Adds a bundle to be managed
   *
   * @throws {Error} If the path doesn't exist
   *
   * @param {Object} bundle Bundle to add to the stack
   * @return {Object} Return bundled for chaining
   */
  function add(bundle) {

    if (bundles[bundle.name]) {
      throw new Error('Bundle has already been added. ' +
        'It is likely that you have two bundles with the same name: ' +
        bundle.name + (bundle.description ? ' "' + bundle.description + '"' : ''))
    } else if (!bundle.name){
      throw new Error('Bundle is missing a name')
    } else if (!bundle.version){
      throw new Error('Bundle \'' + bundle.name + '\' is missing a version')
    }
    if (checkDependancies(bundle) || !options.strictDependencyChecking) {
      bundles[bundle.name] = bundle
    } else {
      throw new Error('Dependencies for \'' + bundle.name + '\' were not met')
    }

    return self
  }

  /**
   * Takes a path to bundle.js, requires it and adds it to be managed.
   *
   * @throws {Error} If the path doesn't exist
   *
   * @param {String} bundlePath The path to the bundle.js
   * @return {Object} Return bundled for chaining
   */
  function addPath(bundlePath) {
    var configPath = bundlePath + '/' + options.bundleConfig
      , bundle

    if (!existsSync(bundlePath)) {
      throw new Error('Unable to find bundle: ' + bundlePath)
    }
    if (!existsSync(configPath)) {
      throw new Error('Unable to find bundle config: ' + configPath)
    }

    bundle = require(configPath)
    bundle.path = bundlePath
    add(bundle)

    return self
  }

  /**
   * Takes a path and a list of bundles to add
   *
   * @param {String} bundlePath The base path for all the bundles
   * @param {Array} bundles Array of bundle names to add
   * @return {Object} Return bundled for chaining
   */
  function addBundles(bundlePath, bundles) {
    bundles.forEach(function(bundle) {
      options.logger.info('Adding bundle: ' + bundle)
      addPath(bundlePath + '/' + bundle)
    })
    return self
  }

  /**
   * Returns an Array full of named properties from all managed bundles.
   * If the bundle property is an Array it will concatenated into one array.
   * An optional compare function can be given and only values that cause
   * compare to return true will be added to the return array.
   *
   * @param {String} propertyName The name of the property to extract
   * @param {Function} compare Optional compare function which should return compare(value, bundle)
   * true if the value it to be returned
   * @return {Array} Return bundled for chaining
   */
  function get(propertyName, compare) {
    var returned = []
    if (compare === undefined) {
      compare = function(value) {
        return value !== undefined
      }
    }
    Object.keys(bundles).forEach(function(key) {
      var bundle = bundles[key]
      if (bundle[propertyName] === undefined) {
        return false
      }
      if (compare(bundle[propertyName], bundle)) {
        if (Array.isArray(bundle[propertyName])) {
          returned = returned.concat(bundle[propertyName])
        } else {
          returned.push(bundle[propertyName])
        }
      }
    })
    return returned
  }

  /**
   * Iterates through all bundles and perform the given function on properties
   *
   * @param {String} propertyName The name of the property to iterator over
   * @param {Function} fn Function to call for each property. fn(bundle, item, done)
   * @param {Function} done To be called once all the bundle properties have been processed.
   * If omit done the properties will be processed synchronously
   * @return {Array} Return bundled for chaining
   */
  function forEach(propertyName, fn, done) {
    async.forEach(Object.keys(bundles), function(key, bundleDone) {
      var bundle = bundles[key]
      if (bundle[propertyName] === undefined) {
        options.logger.info('Not found ' + propertyName + ' in bundle ' + bundle.name)
        return false
      }
      if (!Array.isArray(bundle[propertyName])) {
        bundle[propertyName] = [bundle[propertyName]]
      }
      if (typeof done === 'function') {
        async.forEach(bundle[propertyName], function(item, fnDone) {
          fn(item, bundle, fnDone)
        }, function(error) {
          bundleDone(error)
        })
      } else {
        bundle[propertyName].forEach(function(item) {
          fn(item, bundle)
        })
        bundleDone()
      }
    }, function(error) {
      if (typeof done === 'function') {
        done(error)
      }
    })
    return self
  }

  /**
   * Initialize all the bundles by running all the initialize functions in turn start
   * with all the 0 index and so on.
   *
   * @param {Function} done Optional callback that is called one
   * @return {Array} Return bundled for chaining
   */
  function initialize(done) {

    var initializeFns = {}

    // Build the initialization stack
    Object.keys(bundles).forEach(function(key) {

      var bundleInitializeFn = bundles[key].initialize

      if (bundleInitializeFn !== undefined) {
        if (initializeFns[0] === undefined) {
          initializeFns[0] = []
        }
        if (typeof bundleInitializeFn === 'function') {
          bundleInitializeFn.bundleName = key
          initializeFns[0].push(bundleInitializeFn)
        } else if (Array.isArray(bundleInitializeFn)) {
          var count = 0
          bundleInitializeFn.forEach(function(fn) {
            fn.bundleName = key
            if (initializeFns[count] === undefined) {
              initializeFns[count] = []
            }
            initializeFns[count].push(fn)
            count += 1
          })
        }
      }
    })

    function getParamNames(func) {
      var funStr = func.toString()
      return funStr.slice(funStr.indexOf('(')+1, funStr.indexOf(')')).match(/([^\s,]+)/g)
    }


    // Loop through and execute all the initialize functions in order
    async.forEachSeries(Object.keys(initializeFns), function(level, levelDone) {

      async.forEachSeries(initializeFns[level], function(fn, fnDone) {
        options.logger.info('Initializing Bundle: ' + fn.bundleName)
        // If there is only one param then assume it is not async
        if (getParamNames(fn).length === 1) {
          fn(app)
          fnDone()
        } else {
          fn(app, fnDone)
        }
      }, function(error) {
        levelDone(error)
      })

    }, function(error) {
      if (typeof done === 'function') {
        done(error)
      }
    })
  }

  self.addPath = addPath
  self.addBundles = addBundles
  self.initialize = initialize
  self.get = get
  self.forEach = forEach

  return self
}