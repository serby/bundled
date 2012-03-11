# Bundled - A standalone bundle manage

Bundles allows you to add a standalone extension system any application.

[![build status](https://secure.travis-ci.org/serby/bundled.png)](http://travis-ci.org/serby/bundled)

## Installation

      npm install bundled

## Usage

* Create a folder to house all of your bundles
* Create a bundle folder
* Create bundle.js which must have the following:

    modules.exports = {
      name: 'Hoozit',
      version: '0.0.1',
      description: 'This is a very cool hoozit',
      nav: { title: 'Hoozit', url: 'http://hoozit.com' }
    };

* Then add to your application like so:

    var bundled = require('bundled')(app);
    bundled.addPath('bundle/hoozit');

* You can add as unlimited properties to a bundle and retrieve them later using:

    var bundled = require('bundled')(app);
    bundled.addPath('bundle/hoozit');
    bundled.get('nav'); // Returns an array of all the bundles value for **nav**

* If you need to initialize code for your bundle you can add an initialize function or even an array of functions.

    modules.exports = {
      name: 'Hoozit',
      version: '0.0.1',
      description: 'This is a very cool hoozit',
      nav: { title: 'Hoozit', url: 'http://hoozit.com' },
      initialize: function(app, done) {
        app.hoozit = 'I am a hoozit';
        done();
      }
    };

For more information take a look at the tests.

## Credits
[Paul Serby](https://github.com/serby/) follow me on [twitter](http://twitter.com/PabloSerbo)

## Licence
Licenced under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
