import { Router } from "express";
import Blog from "../Models/blogSchema.js"
import User from "../Models/userSchema.js";
const blogRoute = Router();

blogRoute.get("/",(req, res, next) => {
    const {search} = req.query;
    const finder = search ? {title: search} : {};

    Blog.find(finder)
    .populate("user", {username:1, name:1})
    .then(blog => {res.json(blog)})
    .catch(err => {
        res.status(400).json({error: "no query"})
        next(err);
    });
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

blogRoute.patch("/:id/like", (req, res, next) => {
    const { id } = req.params;
    Blog.findByIdAndUpdate(
        id, 
        { $inc: { likes: 1 } }, 
        { new: true }
    )
    .then(updatedBlog => {
        if(!updatedBlog){
            return res.status(404).json({error: "Blog does not exist"})
        }
        res.status(200).json(updatedBlog)})
        .catch(err => {
            if (err.name === 'CastError') {
                return res.status(400).json({ error: "malformed id" });
            }
            next(err);
        });
    });
    

    export default blogRoute;