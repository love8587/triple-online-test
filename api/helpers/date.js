const moment = require('moment')
const parseFormat = require('moment-parseformat')
const API_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZZ'
const DB_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

var _convertDateTime = function (iso8601, format, utcOffset = '+00:00') {
  var converted = moment(iso8601, [moment.ISO_8601, parseFormat(iso8601)])

  return (converted.isValid())
    ? converted.utcOffset(utcOffset).format(format) : moment().utcOffset(utcOffset).format(format)
}

var nowForDb = function (utcOffset = '+00:00') {
  return moment().utcOffset(utcOffset)
    // .utc()
    .format(DB_DATE_FORMAT)
}

var nowForApi = function (utcOffset = '+00:00') {
  return moment().utcOffset(utcOffset)
    // .utc()
    .format(API_DATE_FORMAT)
}

var toDateTimeForDb = function (iso8601, utcOffset = '+00:00') {
  if (!iso8601) {
    return null
  }

  if (iso8601 === '0000-00-00 00:00:00') {
    iso8601 = nowForDb(utcOffset)
  }

  return _convertDateTime(iso8601, DB_DATE_FORMAT, utcOffset)
}

var toDateTimeForApi = function (iso8601, utcOffset = '+00:00') {
  if (!iso8601) {
    return null
  }

  if (iso8601 === '0000-00-00 00:00:00') {
    iso8601 = nowForApi(utcOffset)
  }

  return _convertDateTime(iso8601, API_DATE_FORMAT, utcOffset)
}

function convertUnixTime (unixTimestamp, utcOffset = '+00:00') {
  return moment(parseInt(unixTimestamp)).utcOffset(utcOffset)
}

module.exports = {
  API_DATE_FORMAT: API_DATE_FORMAT,
  DB_DATE_FORMAT: DB_DATE_FORMAT,
  toDateTimeForDb: toDateTimeForDb,
  nowForDb: nowForDb,
  toDateTimeForApi: toDateTimeForApi,
  nowForApi: nowForApi,
  convertUnixTime: convertUnixTime
}
