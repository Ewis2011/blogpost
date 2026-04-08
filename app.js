import express from "express"
import mongoose from "mongoose";
import blogRoute from "./Controllers/blogRoute.js"
import usersRoute from "./Controllers/usersRoute.js"
import loginRoute from "./Controllers/loginRoute.js"
import {tokenExtractor} from "./Middlewares/tokenExtractor.js";
import errorHandler from "./Middlewares/errorHandler.js"

const mongouri = process.env.MONGO_URI;
mongoose.connect(mongouri, {family: 4})
.then(()=> console.log("Connected"))
.catch(e => console.log("Connection Failed", e));

const app = express();
app.use(express.json());
app.use(tokenExtractor)
app.use("/api/blogs", blogRoute);
app.use("/api/users", usersRoute);
app.use("/api/login", loginRoute);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log("Server is running...");
});
