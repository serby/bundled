module.exports = {
  name: 'Hoozit',
  version: '0.0.1',
  description: 'A very fancy hoozit',
  nav: ['main hoozit', 'second hoozit'],
  initialize: function(app, done) {
    app.hoozit = {
      initialized: true
    };
    app.order.push('hoozit');
    done();
  }
};