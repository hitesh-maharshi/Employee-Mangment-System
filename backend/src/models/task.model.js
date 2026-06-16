import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        taskName : {
            type : String,
            required : [true, "Task name is required"],
            trim : true
        },
        description : {
            type : String,
            trim : true
        },
        assignedUserId :{
            type : mongoose.Schema.Types.ObjectId,
            ref : "User",
            required : [true, "Assigned user ID is required"],
        },
        assignedUser : {
            type : String,
            required : [true, "Assigned user is required"],
            trim : true
        },
        status : {
            type : String,
            enum : ["pending", "in progress", "completed"],
            default : "pending"
        },
    },
    {
        timestamps : {
            createdAt : "created_at",
            updatedAt : "updated_at"
        }
    }
);
   export const Task = mongoose.model("Task", taskSchema);
    