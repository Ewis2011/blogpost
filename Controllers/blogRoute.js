import { Router } from "express";
import Blog from "../Models/blogSchema.js"
import User from "../Models/userSchema.js";
import jwt from "jsonwebtoken"
import {userExtractor} from "../Middlewares/tokenExtractor.js"
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
        .catch(error => {
            next(error);
        });

});

blogRoute.post("/", userExtractor ,(req, res, next) => {

    const userId = req.user.id;
    const creator = req.user;
    delete creator.iat;
    delete creator.exp;

    User.findOne({_id:userId})
    .then(user => {
        if(!user){
            return res.status(400).json({error:"user not found"});
        }
        const newBlog = new Blog(
            {
                ...req.body,
                user: userId
            }
        );
        
        return newBlog.save().then(savedBlog => {
            return {savedBlog, user}
        });
    })
    .then(({savedBlog, user}) => {
        user.blogs = user.blogs.concat(savedBlog._id);
        return user.save().then(() => savedBlog);
    })
    .then(blog => res.status(201).json({blog, creator: req.user}))
    .catch(error => {
        res.status(401).json({error: "Unauthorized user"})
    });
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
            return res.status(400).json({error: "Blog not found"})
        }
        res.status(200).json(updatedBlog)})
        .catch(error => {
            next(error);
        });
    });
    
blogRoute.delete("/:id", userExtractor,(req, res, next)=>{
    const id = req.params.id;
    const userOfAction = req.user;
    delete userOfAction.iat;
    delete userOfAction.exp;
    const userId = req.user.id;

    if(!userId){
        res.status(401).json({error: "Invalid Id"});
    }
    Blog.findById(id)
    .then((blog) => {
        if(!blog){
           return res.status(400).json({error: "Blog not found"});    
        }
        if (blog.user.toString() === userId)
           return Blog.deleteOne({_id:id}).
            then(() => {
                res.status(200).json({message:"Deleted Successfully", user: userOfAction});
            })
        else{
            res.status(403).json({error: "Permission denied!"});
        }
    })
    .catch(error => next(error));
});

export default blogRoute;