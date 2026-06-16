import mongoose from "mongoose";

const timeLogSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],

    },

    project: {
        type: String,
        required: [true, "Project is required"],
    },

    date: {
        type: Date,
        default: Date.now,
    },

    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true,
    },

    totalTime: {
        type: Number,
        default: 0,
    }
},
    {
        timestamps: true,
    });


const ProjectSummerySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User ID is required"]
    },

    project: {
        type: String,
        required: [true, "Project is required"],
    },

    date: {
        type: Date,
        default: Date.now,
    },

    totalTime: {
        type: Number,
        default: 0,
    }

}, {
    timestamps: true,
});

export const TimeLog = mongoose.model("TimeLog", timeLogSchema);
export const ProjectSummery = mongoose.model("ProjectSummery", ProjectSummerySchema);