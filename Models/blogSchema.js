import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title:String,
    author:String,
    url:String,
    likes:String,
});
const Blog = mongoose.model("Blog", blogSchema);

export default Blog;