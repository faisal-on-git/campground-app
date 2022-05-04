if(process.env.NODE_ENV!=='production'){
    require('dotenv').config();
}

//mongodb+srv://usernameIsFaisal:<password>@cluster0.iaivb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
// console.log(process.env.CLOUDINARY_SECRET);
// console.log(process.env.CLOUDINARY_KEY);



const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/user');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const { Console } = require('console');
//const { dangerouslyDisableDefaultSrc } = require('helmet/dist/types/middlewares/content-security-policy');
//const MongoDBStore = require('connect-mongo')(session);
const MongoDBStore = require("connect-mongo");
//const dbUrl=process.env.DB_URL;
//'mongodb://localhost:27017/yelp-camp'
const dbUrl=process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp' ;
mongoose.connect(dbUrl, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
    useNewUrlParser: true,
    
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());

// const store = new MongoDBStore({
//     url: dbUrl,
//     secret:'thisshouldbeabettersecret!',
//     touchAfter: 24 * 60 * 60
// });
// const store = MongoDBStore.create({
//     url: dbUrl,
//     secret:'thisshouldbeabettersecret!',
//     touchAfter: 24 * 60 * 60
// });

// store.on("error", function (e) {
//     console.log("SESSION STORE ERROR", e)
// })

const sessionConfig = {
    store:MongoDBStore.create({
        mongoUrl: dbUrl
    }),
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session()); //use passport session after session



passport.use(new LocalStrategy(User.authenticate()));
// app.use((req, res, next) => {
//     res.locals.success = req.flash('success');
//     res.locals.error = req.flash('error');
//     next();
// })

app.use((req, res, next) => {
   //  console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})

