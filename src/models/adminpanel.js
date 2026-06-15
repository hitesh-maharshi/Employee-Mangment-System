import mongoose from "mongoose";

const adminpanelSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        name :{
            type : String,
            required : [true, "name is required"],
            trim : true
        },
        email :{
            type : String,
            required : [true, "Email is required"],
            trim : true
        },
        loginTime :{
            type : Date,
            required : [true, "Login time is required"],
        },
        logoutTime :{
            type : String,
            default : "Active",
        },
       ProjectNames: {
            type: Map,
            of: Number,
            default: {}
        },
        totalHoursWorked :{
            type : Number,
            default : 0
        },
    
      
    },
    {
        timestamps : {
            createdAt : "created_at",
        }
    }
);

export const AdminPanel = mongoose.model("AdminPanel", adminpanelSchema);

 