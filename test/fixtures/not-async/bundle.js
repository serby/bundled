module.exports = {
  name: 'Not Async',
  version: '0.0.1',
  initialize: function(app) {
    app.order.push('not async')
  }
}