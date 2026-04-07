import { Router } from "express";
import Blog from "../Models/blogSchema.js"
import User from "../Models/userSchema.js";
const blogRoute = Router();

blogRoute.get("/",(req, res, next) => {
    let {page, limit} = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 3;
    
    const {search, author, sortBy, order} = req.query;
    const filter = {};
    const allowedSortFields = ["likes", "title", "author"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "likes";
    const sortOrder = order === "asc" ? 1 : -1;
    if (search) {
        filter.title = {$regex: search, $options:"i"};
    }
    if (author) {
        filter.author = {$regex: author, $options:"i"};
    }
    if (sortBy && !allowedSortFields.includes(sortBy)){
        const error = new Error("Invalid sort field");
        return next(error)
    }
        Blog.countDocuments(filter)
        .then(totalCount => {
            return Blog.find(filter)
                .sort({ [sortField]: sortOrder })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate("user", { username: 1, name: 1 })
                .then(blogs => {
                    res.json({
                        total: totalCount,
                        page: page,
                        limit: limit,
                        data: blogs
                    });
                });
        })
        .catch(err => {
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