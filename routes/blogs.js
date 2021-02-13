var express = require("express"),
    router  = express.Router();
    Blog    = require("../models/blogs");
// INDEX
router.get("/blogs", function(req, res) {
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
router.get("/blogs/new", isLoggedIn, function(req, res) {
    res.render("new");
});

// CREATE
router.post("/blogs", isLoggedIn, function(req, res) {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    var newBlog = {
        title : req.body.blog.title,
        image: req.body.blog.image,
        body: req.body.blog.body,
        author: {
            id: req.user._id,
            username: req.user.username
        }
    }
    Blog.create(newBlog, function(err, blog) {
        if(err) {
            console.log(`ERROR! - ${err}`);
        }
        else {
            res.redirect("/blogs");
        }
    });
});

// SHOW
router.get("/blogs/:id", function(req, res) {
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
router.get("/blogs/:id/edit", checkOwnership, function(req, res) {
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
router.put("/blogs/:id", checkOwnership, function(req, res) {
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
router.delete("/blogs/:id", checkOwnership, function(req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            res.redirect("/blogs");
        }
        else {
            res.redirect("/blogs");
        }
    });
});

// MIDLLEWARE
function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkOwnership(req, res, next) {
    if(req.isAuthenticated()) {
        Blog.findById(req.params.id, function(err, blog) {
            if(err) {
                res.redirect("back");
            } else {
                if(blog.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
}

module.exports = router;