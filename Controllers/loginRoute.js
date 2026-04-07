import { Router } from "express";
import User from "../Models/userSchema.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const loginRoute = new Router();

loginRoute.post("/", (req, res, next) => {
    const { username, password } = req.body;

    User.findOne({ username })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: "invalid username or password" });
            }
            return bcrypt.compare(password, user.password).then(passwordCorrect => {
                if (!passwordCorrect) {
                    return res.status(401).json({ message: "invalid username or password" });
                }
                const userForToken = {
                    username: user.username,
                    id: user._id
                };
                const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60 * 60 });

                res.status(200).send({ 
                    token, 
                    username: user.username, 
                    name: user.name 
                });
            });
        })
        .catch(err => next(err));
});

export default loginRoute;