const Review = require('../models/review')
const Campground = require('../models/campgrounds');

module.exports.postReview = async(req, res)=>{
    const {id} = req.params
    const campground = await Campground.findById(id)
    const review = await new Review(req.body)
    review.author = req.user._id
    campground.reviews.push(review)
    await campground.save()
    await review.save()
    req.flash('success', 'successfully created a review!');
    res.redirect(`/campgrounds/${campground._id}/show`)
}

module.exports.deleteReview = async(req, res)=>{
    const { revId, id } = req.params;  
    //the way i see the code below is that it is not a two way relationship, so you cannot use it to delete a campground along with its review.
    //it is used to delete a review, and pull that review away from the campground where it is found
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: revId}})
    await Review.findByIdAndDelete(revId)
    //i decided to put the code below because after deleting and logging in again i keep gettiing redirected to delete route for a campground i once deleted. 
    // delete req.session.returnTo;
    req.flash('success', 'successfully deleted review!');
    res.redirect(`/campgrounds/${id}/show`)
}