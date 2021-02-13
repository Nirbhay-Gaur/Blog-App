var express  = require("express"),
    router   = express.Router();
    User     = require("../models/user"),
    passport = require("passport");
// LANDING
router.get("/", function(req, res) {
    res.render("landing");
});

// AUTH ROUTES

// REGISTER
router.get("/register", function(req, res) {
    res.render("register");
});

router.post("/register", function(req, res) {
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
router.get("/login", function(req, res) {
    res.render("login");
}); 

router.post("/login", passport.authenticate("local", {
    successRedirect: "/blogs",
    failureRedirect: "/login"
}));

// LOGOUT
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/blogs");
});

module.exports = router;