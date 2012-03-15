module.exports = {
  name: 'Woozit',
  version: '0.0.1',
  dependencies: {
    'Hoozit': '*'
  },
  description: 'A very fancy woozit',
  nav: ['main woozit', 'second woozit'],
  initialize: [
    function(app, done) {
      app.woozit = [true];
      app.order.push('woozit 1');
      done();
    },
    function(app, done) {
      app.woozit.push(true);
      app.order.push('woozit 2');
      done();
    }
  ]
};