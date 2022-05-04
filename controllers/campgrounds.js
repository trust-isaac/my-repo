const Campground = require('../models/campgrounds');
const {cloudinary} = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken})


module.exports.index = async (req, res) => {
    const camps = await Campground.find({});
    res.render('campgrounds/index', { camps })
}

module.exports.renderNewForm = (req, res)=>{
    res.render('campgrounds/new')
}

module.exports.postNew = async (req, res, next)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
   
    const newCamp = req.body;
    // if(!req.body.title) throw new ExpressError('must include title', 400);
    const campground = await new Campground(newCamp)
    campground.geometry = geoData.body.features[0].geometry
    campground.images = req.files.map(f =>({url: f.path, filename: f.filename}))
    //the user here refers to a particular user instance on the session
    campground.author = req.user._id
    await campground.save()
    console.log(campground)
    req.flash('success', 'successfully created a campground!');
    res.redirect(`/campgrounds/${campground._id}/show`) 
}

module.exports.show = async (req, res) => {
    const {id} = req.params
    const camp = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if(!camp){
        req.flash('error', 'cannot find that campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { camp })
}



module.exports.editCampgroundForm = async (req, res) => {
    const {id} = req.params
    const camp = await Campground.findById(id);
    if(!camp){
        req.flash('error', 'cannot edit that campground')
        return res.redirect('/campgrounds')
    }
    
    res.render('campgrounds/edit', { camp })
}

module.exports.postEditedCampground = async (req, res) => {
    const { id } = req.params;
    console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body });
    const imgs = req.files.map(f =>({url: f.path, filename: f.filename}))
    campground.images.push(...imgs)
    await campground.save() 
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages} } } })
        console.log(campground)
    } 
    req.flash('success', 'successfully edited a campground!');
    res.redirect(`/campgrounds/${campground._id}/show`)
}

module.exports.deleteCampground = async(req, res)=>{
    const { id } = req.params;  
    await Campground.findByIdAndDelete(id)
    req.flash('success', 'successfully deleted a campground!');
    res.redirect('/campgrounds')
}