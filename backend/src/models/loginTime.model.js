import mongoose from "mongoose";

const loginTimeSchema = new mongoose.Schema({

    login:{
        type : Date,
        required : [true, "Login time is required"],
    },

    logOut:{
        type : Date,
        default : null,
    },

    status : {
        type : String,
        enum : ["login", "logout"],
        default : "login"
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Assigned user is required'],
    }

})

const LoginTime = mongoose.model("LoginTime", loginTimeSchema);
export default LoginTime ;