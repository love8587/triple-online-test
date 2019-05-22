var singleton = {}
module.exports.knex = function (config) {
  if (!singleton || !singleton[config.connection.host]) {
    singleton[config.connection.host] = require('knex')(config)
  }

  return singleton[config.connection.host]
}
