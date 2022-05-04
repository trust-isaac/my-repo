const express = require('express');
const router = express.Router()
const multer = require('multer')
const catchAsync = require('../utils/catchAsync')
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')
const {storage} = require('../cloudinary')
const upload = multer({storage})
const campgrounds = require('../controllers/campgrounds')


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.postNew))
    
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.postEditedCampground))
    .delete(isLoggedIn,  isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/show', catchAsync(campgrounds.show));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCampgroundForm));


module.exports = router