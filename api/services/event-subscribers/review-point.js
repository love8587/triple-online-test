const debug = require('debug')('triple-online-test:services:review-point')
const PointService = require('api/services/point-service')
const ReviewPointPlaceService = require('api/services/review-point-history')
const ReviewPointCalcurator = require('api/utils/review-point-calcurator')

class ReviewPointSubscriber {
  constructor () {
    this.PointService = new PointService()
    this.ReviewPointPlaceService = new ReviewPointPlaceService()
    this.Calcurator = new ReviewPointCalcurator()
  }

  async findGivenReviewPoint (reviewId) {
    let wheres = {
      'reasonType': 'review',
      'reasonId': reviewId
    }

    let givenReviewPoint = await this.PointService.getTotalPoint(wheres)
    return givenReviewPoint ? givenReviewPoint[0] : null
  }

  async update (event) {
    if (event.type !== 'REVIEW') {
      throw new Error('This Subscriber is only used for REVIEW type')
    }

    let givenReviewPoint = await this.findGivenReviewPoint(event.reviewId)
    let givenPointPlace = await this.ReviewPointPlaceService.getPointPlace(event.placeId)

    debug('givenReviewPoint ============> ', givenReviewPoint)
    debug('givenPointPlace ============> ', givenPointPlace)
    let point = this.Calcurator.calcurate(event, givenReviewPoint, givenPointPlace)
    debug('point ============> ', point)

    if (point.totalPoint === 0 && point.totalBonus === 0) {
      return
    }

    await this.PointService.addHistory(event.userId, {
      type: 'review',
      id: event.reviewId
    }, point)

    if (event.action.toUpperCase() === 'ADD' && point.totalBonus > 0) {
      await this.ReviewPointPlaceService.addReviewPointPlace(event.reviewId, event.placeId)
    }

    if (event.action.toUpperCase() === 'DELETE' && point.totalBonus < 0) {
      await this.ReviewPointPlaceService.deleteReviewPointPlace(event.reviewId, event.placeId)
    }
  }
}

module.exports = ReviewPointSubscriber
