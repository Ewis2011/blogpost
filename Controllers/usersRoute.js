import { Router } from "express";
import User from "../Models/userSchema.js";
import bcrypt from "bcrypt";

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
    .then(savedUser => {
        const userObj = savedUser.toObject();
        res.status(201).send(userObj);
    })
    .catch(e => next(e));
});

usersRoute.get("/", (req, res, next) => {
    User.find({})
        .populate("blogs", { title: 1, url: 1, likes: 1 }) 
        .then(user => {
            res.json(user);
        })
        .catch(err => next(err));
});
export default usersRoute;