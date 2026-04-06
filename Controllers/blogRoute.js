import { Router } from "express";
import Blog from "../Models/blogSchema.js"
import User from "../Models/userSchema.js";
const blogRoute = Router();

blogRoute.get("/",(req, res, next) => {
    Blog.find({})
    .then(blog => {res.json(blog)})
    .catch(err => next(err));
});

blogRoute.post("/",(req, res, next) => {
    User.findOne({})
    .then(creator => {
        const newBlog = new Blog({...req.body,
            creation:{
                username: creator.username,
                name: creator.name
            }});

        return newBlog.save()
    })
    .then(blog => res.status(201).json(blog))
    .catch(err => next(err));
});

export default blogRoute;