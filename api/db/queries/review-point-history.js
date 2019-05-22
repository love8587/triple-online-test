const config = require('config')
const knex = require('api/helpers/db').knex(config.get('db.master'))
const dateHelper = require('../../helpers/date')

function setWheresQuery (query, wheres) {
  if (!query) {
    throw new Error('query is empty')
  }

  if (!wheres) {
    return
  }

  if (wheres.placeId) {
    query.whereIn('place_id', wheres.placeId)
  }

  if (wheres.reviewId) {
    query.whereIn('review_id', wheres.reviewId)
  }
}

async function getPointPlace (placeId) {
  let result = await knex.withSchema('triple_test')
    .select('*')
    .from('review_point_history')
    .where('place_id', placeId)
    .limit(1)

  return result
}

async function addPointPlace (reviewId, placeId) {
  let result = await knex.withSchema('triple_test')
    .into('review_point_history')
    .insert({
      'review_id': reviewId,
      'place_id': placeId,
      'created_at': dateHelper.nowForDb(),
      'updated_at': dateHelper.nowForDb()
    }, '*')

  return result
}

async function deletePointPlace (reviewId) {
  let result = await knex.withSchema('triple_test')
    .from('review_point_history')
    .where('review_id', reviewId)
    .del()

  return result
}

module.exports = {
  setWheresQuery,
  getPointPlace,
  addPointPlace,
  deletePointPlace
}
