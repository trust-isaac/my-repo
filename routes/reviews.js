const express = require('express');
const router = express.Router({mergeParams:true})
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const {validateReview, isReviewAuthor, isLoggedIn} = require('../middleware')
const reviews = require('../controllers/reviews')




router.post('/', isLoggedIn, validateReview, catchAsync(reviews.postReview))

router.delete('/:revId',isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))


module.exports = router