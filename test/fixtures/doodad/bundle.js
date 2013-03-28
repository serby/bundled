module.exports = {
  name: 'Doodad',
  version: '0.0.1',
  description: 'A very cool doodad',
  nav: 'doodad',
  initialize: [
    function(app, done) {
      process.nextTick(function () {
        app.order.push('doodad 1')
        done()
      })
    },
    function(app, done) {
      setTimeout(function () {
        app.order.push('doodad 2')
        done()
      }, 50)
    }
  ]
};