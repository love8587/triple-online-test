const debug = require('debug')('triple-online-test:controllers:sample:get')

module.exports = {
  method: 'GET',
  path: '/',
  config: {
    description: 'This is a Sample'
  },
  handler: (request, h) => {
    return {
      name: 'Hello, Summer!'
    }
  }
}
