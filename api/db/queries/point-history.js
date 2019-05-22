const config = require('config')
const knex = require('api/helpers/db').knex(config.get('db.master'))
const dateHelper = require('../../helpers/date')
const commonQuery = require('./common')

function setWheresQuery (query, wheres) {
  if (!query) {
    throw new Error('query is empty')
  }

  if (!wheres) {
    return
  }

  if (wheres.reasonType) {
    query.where('reason_type', wheres.reasonType)
  }

  if (wheres.reasonId) {
    query.where('reason_id', wheres.reasonId)
  }

  if (wheres.userId) {
    query.whereIn('user_id', wheres.userId)
  }
}

async function getAllPointHistory (wheres = {}, pagination = {}) {
  let query = knex.withSchema('triple_test')
    .select('*')
    .from('user_point_history')

  setWheresQuery(query, wheres)
  commonQuery.setPagination(query, pagination.sortBy, pagination.orderBy, pagination.page, pagination.limit)

  return query
}

async function addPointHistory (userId, reason, point) {
  let result = await knex.withSchema('triple_test')
    .into('user_point_history')
    .insert({
      'user_id': userId,
      'reason_type': reason.type,
      'reason_id': reason.id,
      'basic_point': point.totalPoint,
      'bonus_point': point.totalBonus,
      'created_at': dateHelper.nowForDb(),
      'updated_at': dateHelper.nowForDb()
    }, '*')

  return result
}

async function getTotalPoint (wheres) {
  let query = knex.withSchema('triple_test')
    .sum('basic_point as basic_point')
    .sum('bonus_point as bonus_point')
    .from('user_point_history')

  setWheresQuery(query, wheres)

  return query
}

module.exports = {
  setWheresQuery,
  getAllPointHistory,
  addPointHistory,
  getTotalPoint
}
