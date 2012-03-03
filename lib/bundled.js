var path = require('path')
  , async = require('async')
  ;

module.exports.createBundled = function(serviceLocator) {

  var self = {}
    , bundles = {};

  /**
   * Adds a bundle to be managed
   *
   * @throws {Error} If the path doesn't exist
   *
   * @param {Object} bundle Bundle to add to the stack
   * @return {Object} Return bundled for chaining
   */
  function add(bundle) {

    if (bundles[bundle.name] !== undefined) {
      throw new Error('Bundle has already been added. ' +
        'It is likely that you have two bundles with the same name: ' +
        bundle.name + (bundle.description ? ' "' + bundle.description + '"' : ''));
    }

    bundles[bundle.name] = bundle;

    return self;
  }

  /**
   * Takes a path to bundle.js, requires it and adds it to be managed.
   *
   * @throws {Error} If the path doesn't exist
   *
   * @param {String} bundlePath The path to the bundle.js
   * @return {Object} Return bundled for chaining
   */
  function addByPath(bundlePath) {
    if (path.existsSync(bundlePath)) {
      var bundle = require(bundlePath);
      bundle.path = path.dirname(bundlePath);
      add(bundle);
    } else {
      throw new Error('Unable to find bundle:' + bundlePath);
    }

    return self;
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
      serviceLocator.logger.verbose('Adding bundle: ' + bundle);
      addByPath(bundlePath + '/' + bundle + '/bundle.js');
    });
    return self;
  }


  /**
   * Returns an Array full of named properties from all managed bundles.
   * If the bundle property is an Array it will concatenated into one array.
   * An optional compare function can be given and only value matching the
   *
   * @param {String} propertyName The base path for all the bundles
   * @param {Function} compare Optional compare function which should return true
   * if want the property.
   * @return {Array} Return bundled for chaining
   */
  function get(propertyName, compare) {
    var returned = [];
    if (compare === undefined) {
      compare = function(value) { return value !== undefined; };
    }
    Object.keys(bundles).forEach(function(key) {
      var bundle = bundles[key];
      if (bundle[propertyName] === undefined) {
        return false;
      }
      if (compare(bundle[propertyName])) {
        if (Array.isArray(bundle[propertyName])) {
          returned = returned.concat(bundle[propertyName]);
        } else {
          returned.push(bundle[propertyName]);
        }
      }
    });
    return returned;
  }

  /**
   * Iterates through all bundles and perform the given function on properties
   *
   * @param {String} propertyName The base path for all the bundles
   * @param {Function} propertyName Optional compare function which should return true
   * @return {Array} Return bundled for chaining
   */
  function forEachProperty(propertyName, fn, done) {
    Object.keys(bundles).forEach(function(key) {
      var bundle = bundles[key];
      if (bundle[propertyName] === undefined) {
        serviceLocator.logger.info('Not found ' + propertyName + ' in bundle ' + bundle.name);
        return false;
      }
      if (!Array.isArray(bundle[propertyName])) {
        bundle[propertyName] = [bundle[propertyName]];
      }
      bundle[propertyName].forEach(function(item) {
        fn(bundle, item);
      });
    });
    return self;
  }

  /**
   * Returns an Array full of named properties from all managed bundles.
   * If the bundle property is an Array it will concatenated into one array.
   * An optional compare function can be given and only value matching the
   *
   * @param {String} propertyName The base path for all the bundles
   * @param {Function} compare Optional compare function which should return true
   * if want the property.
   * @return {Array} Return bundled for chaining
   */
  function initBundles(app, properties) {

    // Init Bundles
    Object.keys(bundles).forEach(function(key) {

      var
        bundle = bundles[key],
        property = 'register';

      if ((bundle[property] !== undefined) && (typeof bundle[property] === 'function')) {
        serviceLocator.logger.verbose('Bootstraping Bundle: ' + bundle.name);
        bundle[property](app, properties, serviceLocator);
      }
    });

    Object.keys(bundles).forEach(function(key) {

      var
        bundle = bundles[key],
        property = 'configure';

      if ((bundle[property] !== undefined) && (typeof bundle[property] === 'function')) {
        serviceLocator.logger.verbose('Configuring Bundle: ' + bundle.name);
        bundle[property](app, properties, serviceLocator);
      }
    });

    Object.keys(bundles).forEach(function(key) {

      var
        bundle = bundles[key],
        property = 'finalise';

      if ((bundle[property] !== undefined) && (typeof bundle[property] === 'function')) {
        serviceLocator.logger.verbose('Finalising Bundle: ' + bundle.name);
        bundle[property](app, properties, serviceLocator);
      }
    });
  }

  self.addByPath = addByPath;
  self.get = get;
  self.forEachProperty = forEachProperty;
  self.addBundles = addBundles;
  self.initBundles = initBundles;

  return self;
};