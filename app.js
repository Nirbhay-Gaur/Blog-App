var express           = require("express"),
    app               = express(),
    bodyParser        = require("body-parser"),
    mongoose          = require("mongoose"),
    passport          = require("passport"),
    localStrategy     = require("passport-local"),
    expressSession    = require("express-session"),
    methodOverride    = require("method-override"),
    expressSanitizer  = require("express-sanitizer"),
    User              = require("./models/user"),
    indexRoute        = require("./routes/index"),
    blogRoute         = require("./routes/blogs");

// APP CONFIG
mongoose.connect(process.env.DATABASEURL, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// PASSPORT CONFIG
app.use(expressSession({
    // secret goes here!     
    resave: false,
    saveUninitialized: false
}));    
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ROUTES
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.use(indexRoute);
app.use(blogRoute);

app.listen(process.env.PORT || 3000, process.env.IP);
