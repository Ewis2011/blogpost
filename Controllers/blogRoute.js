import { Router } from "express";
import Blog from "../Models/blogSchema.js"

const blogRoute = Router();

blogRoute.get("/",(req, res, next) => {
    Blog.find({})
    .then(blog => res.json(blog))
    .catch(err => next(err));
});

blogRoute.post("/",(req, res, next) => {
    const newBlog = new Blog(req.body);
    newBlog.save()
    .then(blog => res.status(201).json(blog))
    .catch(err => next(err));
});

export default blogRoute;