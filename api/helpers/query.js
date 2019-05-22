const mysql = require('mysql')

function escape (str, options = {}) {
  return mysql.escape(str)
}

module.exports = {
  escape
}
