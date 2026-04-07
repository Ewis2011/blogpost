import { Router } from "express";
import Blog from "../Models/blogSchema.js"
import User from "../Models/userSchema.js";
const blogRoute = Router();

blogRoute.get("/",(req, res, next) => {
    Blog.find({})
    .populate("user", {username:1, name:1})
    .then(blog => {res.json(blog)})
    .catch(err => next(err));
});

blogRoute.post("/",(req, res, next) => {
    let user;
    User.findOne({})
    .then(creator => {
        if(!creator){
            return res.status(400).json({error:"not found"});
        }
        user = creator;
        const newBlog = new Blog({...req.body, user: user._id});

        return newBlog.save()
    })
    .then(savedBlog => {
        user.blogs = user.blogs.concat(savedBlog._id);
        return user.save().then(() => savedBlog);
    })
    .then(blog => res.status(201).json(blog))
    .catch(err => next(err));
});

export default blogRoute;