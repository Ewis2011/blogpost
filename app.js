import express from "express"
import mongoose from "mongoose";
import blogRoute from "./Controllers/blogRoute.js"

if(process.argv.length < 3){
    console.log("Password must be an arg in cmd")
    process.exit();
}
const passwd = process.argv[2];

const mongouri = `mongodb+srv://aewis20:${passwd}@persons.vwdnoit.mongodb.net/blog?appName=Cluster0`;
mongoose.connect(mongouri, {family: 4});

const app = express();
app.use(express.json());
app.use("/api/blogs", blogRoute);

const PORT = 3003;
app.listen(PORT, ()=>{
    console.log("Server is running...");
});
