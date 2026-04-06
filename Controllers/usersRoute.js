import { Router } from "express";
import User from "../Models/userSchema.js";
import bcrypt from "bcrypt";
import Blog from "../Models/blogSchema.js";
const usersRoute = Router();

usersRoute.post("/", (req, res, next) => {
    const { username, password, name } = req.body;
    if (!username || !password) {
    return res.status(400).json({ message: "a username and password are required" });
    }
    if (username.length < 3 || password.length < 3) {
        return res.status(400).json({ message: "Username and password must be at least 3 characters long" });
    }

    bcrypt.hash(password, 10)
    .then(hashed => {
        const newUser = new User({ username, password:hashed, name });
        return newUser.save();
    })
    .then(user => {
        const userObj = user.toObject();
        delete userObj.password;    
        res.status(201).json(userObj);
    })
    .catch(e => next(e));
});

usersRoute.get("/", (req, res, next) => {
    User.find({})
        .then(users => {
            return Promise.all(users.map(user => {
                const u = user.toObject();
                delete u.password;
                delete u.__v;
                u.id = u._id.toString();
                delete u._id;
                return Blog.find({ "creation.username": user.username })
                    .then(blogs => {
                        u.blogs = blogs.map(blog => {
                            const b = blog.toObject();
                            delete b.__v;
                            b.id = b._id.toString();
                            delete b._id;
                            return b;
                        });
                        return u;
                    });
            }));
        })
        .then(userObjWithBlogs => res.json(userObjWithBlogs))
        .catch(e => next(e));
});
export default usersRoute;