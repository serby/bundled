# Bundled - A standalone bundle manager

Bundled allows you to add a standalone extension system any application.

[![build status](https://secure.travis-ci.org/serby/bundled.png)](http://travis-ci.org/serby/bundled)

## Installation

      npm install bundled

## Usage

* Create a folder to house all of your bundles
* Create a bundle folder
* Create bundle.js which must have the following:

bundle.js

      modules.exports = {
        name: 'Hoozit',
        version: '0.0.1',
        description: 'This is a very cool hoozit', // Optional
        nav: { title: 'Hoozit', url: 'http://hoozit.com' } // Custom properties can be added
      };

* Then add to your application like so:

app.js

      var bundled = require('bundled')(app);
      bundled.addPath('bundle/hoozit');

* You can add as unlimited properties to a bundle and retrieve them later using:

app.js

      var bundled = require('bundled')(app);
      bundled.addPath('bundle/hoozit');
      bundled.get('nav'); // Returns an array of all the bundles value for **nav**

* If you need to initialize code for your bundle you can add an initialize function or even an array of functions.

Single initialize function example:

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

Multiple initialize function example:

      modules.exports = {
        name: 'Hoozit',
        version: '0.0.1',
        description: 'This is a very cool hoozit',
        nav: { title: 'Hoozit', url: 'http://hoozit.com' },
        initialize: [function(app, done) {
          // Do something first. All first level initialization will be executed.
          done();
        }, function(app, done) {
          // Then all second level initialization will be executed. This is handy for circular references.
          app.hoozit = 'I am a hoozit';
          done();
        }]
      };

For more information take a look at the tests.

## Credits

[Paul Serby](https://github.com/serby/) follow me on [twitter](http://twitter.com/PabloSerbo)

## Licence

Licenced under the [New BSD License](http://opensource.org/licenses/bsd-license.php)