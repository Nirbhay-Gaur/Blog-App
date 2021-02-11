var express           = require("express"),
    app               = express(),
    bodyParser        = require("body-parser"),
    mongoose          = require("mongoose"),
    passport          = require("passport"),
    localStrategy     = require("passport-local"),
    expressSession    = require("express-session"),
    methodOverride    = require("method-override"),
    expressSanitizer  = require("express-sanitizer"),
    User              = require("./models/user");

// APP CONFIG
mongoose.connect("mongodb+srv://dbNirbhay:dbNirbhaygaur@cluster01.un73w.mongodb.net/Blog_app?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

// PASSPORT CONFIG
app.use(expressSession({
    secret: "mnbvcxz asdfghjkl poiuytrewq",
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

// LANDING
app.get("/", function(req, res) {
    res.render("landing");
});

// INDEX
app.get("/blogs", function(req, res) {
    Blog.find({}, function(err, blogs) {
        if(err) {
            console.log(`ERROR! - ${err}`);
        }
        else {
            res.render("index", {blogs: blogs});
        }
    });
});

// NEW
app.get("/blogs/new", isLoggedIn, function(req, res) {
    res.render("new");
});

// CREATE
app.post("/blogs", isLoggedIn, function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, function(err, blog) {
        if(err) {
            console.log(`ERROR! - ${err}`);
        }
        else {
            res.redirect("/blogs");
        }
    });
});

// SHOW
app.get("/blogs/:id", function(req, res) {
    Blog.findById(req.params.id, function(err, blog) {
        if(err) {
            console.log(`ERROR! - ${err}`);
            res.redirect("/blogs");
        }
        else 
        {
            res.render("show", {blog: blog});
        }
    });
});

// EDIT
app.get("/blogs/:id/edit", isLoggedIn, function(req, res) {
    Blog.findById(req.params.id, function(err, blog) {
        if(err) {
            res.redirect("/blogs");
        }
        else {
            res.render("edit", {blog: blog});
        }
    });
});

// UPDATE
app.put("/blogs/:id", isLoggedIn, function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, blog) {
        if(err) {
            res.redirect("/blogs");
        }
        else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DESTROY
app.delete("/blogs/:id", isLoggedIn, deleteOk, function(req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            res.redirect("/blogs");
        }
        else {
            res.redirect("/blogs");
        }
    });
});

// AUTH ROUTES

// REGISTER
app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            console.log(err);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/blogs");
        });

    })
});

// LOGIN 
app.get("/login", function(req, res) {
    res.render("login");
}); 

app.post("/login", passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/login"
}));

// LOGOUT
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/blogs");
});

// MIDDLEWARES

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function deleteOk(req, res, next) {
    if(req.user.username !== "mysticalBlog") {
        res.render("notME");
    } else {
        next();
    }
}


app.listen(process.env.PORT || 3000, process.env.IP);