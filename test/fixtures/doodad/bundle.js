module.exports = {
  name: 'Doodad',
  version: '0.0.1',
  description: 'A very cool doodad',
  nav: 'doodad',
  initialize: [
    function(app, done) {
      app.order.push('doodad 1');
      done();
    },
    function(app, done) {
      app.order.push('doodad 2');
      done();
    }
  ]
};