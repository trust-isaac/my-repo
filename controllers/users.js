const User = require('../models/user')
const passport = require('passport')

module.exports.getRegister = (req, res)=>{
    res.render('users/register')
}

module.exports.postRegister = async(req, res)=>{
    try{
        const {username, email, password} = req.body
        const user = new User({username, email})
        const registeredUser = await User.register(user, password)
        //the line below is to keep a user login after registering. 
        //no need to relogin after registration
        req.login(registeredUser, err =>{
            if(err) return next(err)
        })
        req.flash('success', 'Welcome to Yelp Camp!')
        res.redirect('/campgrounds')
    }catch(e){
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.getLogin = (req, res)=>{
    res.render('users/login')
}

module.exports.postLogin = (req, res)=>{
    req.flash('success', 'welcome back!')
    const redirectUrl = req.session.returnTo || '/campgrounds'
    console.log(redirectUrl)
    delete req.session.returnTo;
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res)=>{
    req.logOut()
    req.flash('success', 'Goodbye!')
    res.redirect('/')
}