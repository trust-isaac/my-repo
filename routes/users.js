const express = require('express');
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const users = require('../controllers/users')
const passport = require('passport')


router.route('/register')
    .get(users.getRegister)
    .post(catchAsync(users.postRegister))

router.route('/login')
    .get(users.getLogin)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.postLogin)

router.get('/logout', users.logout)

module.exports = router