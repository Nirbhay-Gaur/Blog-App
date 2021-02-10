var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    expressSanitizer = require("express-sanitizer");

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

// ROUTES

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
app.get("/blogs/new", function(req, res) {
    res.render("new");
});

// CREATE
app.post("/blogs", function(req, res) {
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
app.get("/blogs/:id/edit", function(req, res) {
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
app.put("/blogs/:id", function(req, res) {
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
app.delete("/blogs/:id", function(req, res) {
    Blog.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            res.redirect("/blogs");
        }
        else {
            res.redirect("/blogs");
        }
    });
});

// Error Route
app.get("*", function(req, res) {
    res.render("error");
});

app.listen(process.env.PORT || 3000, process.env.IP);