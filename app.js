if(process.env.NODE_ENV !='production'){
    require('dotenv').config()
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate'); 
const campgrounds = require('./routes/campgrounds')
const reviews = require('./routes/reviews')
const users = require('./routes/users')
const ExpressError = require('./utils/ExpressError');
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const MongoStore = require('connect-mongo');

const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })



const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelps';
mongoose.connect( dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })



app.engine('ejs', ejsMate)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'mysecret' 

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 //this is in seconds and not milliseconds
})
store.on('error', function(e){
    console.log('session store error', e)
})

const sessionConfig={
    store,
    name: 'session',
    secret,
    resave: 'false',
    saveUninitialized: 'true',
    cookies: {
        httpOnly: true,
        secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
//make sure session is used before passport.session...
app.use(session(sessionConfig))
app.use(flash())
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dpizrebuv/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize())
//...here
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// app.use((req, res, next)=>{
//     res.locals.currentUser = req.user
//     res.locals.success = req.flash('success')
//     res.locals.error = req.flash('error')
//     next()
// })

app.use((req, res, next) => {
    if(!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', users)
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/review', reviews)



app.get('/', (req, res)=>{
    res.render('home')
})

//FOR ALL NON-EXISTING ROUTE
app.all('*', (req, res, next) =>{
    // res.send('not found')
    next(new ExpressError('page not found', 404))
})


app.use((err, req, res, next) => {
    const {statusCode = 500} = err
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('campgrounds/error', {err})
    // res.send('oboy, so mething went wrong!')
})
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`serving on port ${port}`)
})