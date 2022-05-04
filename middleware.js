const Campground = require('./models/campgrounds');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError')
const {campgroundSchema, reviewSchema} = require('./schemas.js')

// module.exports.isLoggedIn = (req, res, next)=>{
//     if(!req.isAuthenticated()){
//         req.session.returnTo = req.originalUrl
//         req.flash('error', 'you must be signed in first');
//         return res.redirect('/login')
//     }
//     next()
// }

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

//VALIDATION MIDDLEWARE...
//below is a middleware you want to run before the next middleware, so since it is a middleware, you ought to pass in req and res. And since you will be calling next eventually, you have to put it in...
module.exports.validateCampground = (req, res, next)=> {
    const { error } = campgroundSchema.validate(req.body);
    //there must not be an error, but if there happens to be an error, do this...
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isAuthor = async(req, res, next) =>{
    const {id} = req.params
    const camp = await Campground.findById(id);
    if(!camp.author._id.equals(req.user._id)){
        req.flash('error', 'you do not have permission to do that')
        return res.redirect(`/campgrounds/${id}/show`)
    }
    next()
}
module.exports.isReviewAuthor = async(req, res, next) =>{
    const {id, revId} = req.params
    const review = await Review.findById(revId);
    if(!review.author._id.equals(req.user._id)){
        req.flash('error', 'you do not have permission to do that')
        return res.redirect(`/campgrounds/${id}/show`)
    }
    next()
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    //there must not be an error, but if there happens to be an error, do this...
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}