import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    username:
    {
        type:String,
        unique:true,
    },
    password:String,
    name:String,
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog"
        }
    ]
});

userSchema.set('toJSON', {
    transform: (document, returnedObj) => {
        returnedObj.id = returnedObj._id.toString();
        delete returnedObj._id;
        delete returnedObj.__v;
        delete returnedObj.password
    },
});

const User = mongoose.model("User", userSchema);

export default User;