import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createTask = asyncHandler(async (req, res) => {
    const { taskName, description, assignedUser, assignedUserId } = req.body;

    if (!taskName || !description || !assignedUser || !assignedUserId || String(taskName).trim() === "" || String(description).trim() === "" || String(assignedUser).trim() === "" || String(assignedUserId).trim() === "") {
        throw new ApiError(400, "All fields (taskName, description, assignedUser, assignedUserId) are required");
    }

    const task = await Task.create({
        taskName,
        description,
        assignedUser,
        assignedUserId,
    });

    if (!task) {
        throw new ApiError(402, "task is not find")
    }

    return res.status(201).json(
        new ApiResponse(201, task, "Task created successfully")
    );
});

export const updateTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { taskName, description, assignedUser, assignedUserId } = req.body;
    const updateFields = {
        taskName,
        description,
        assignedUser,
        assignedUserId,
    }

    const task = await Task.findByIdAndUpdate(
        id,
        {
            $set: updateFields,
        },
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    return res.status(200).json(
        new ApiResponse(200, task, "Task updated successfully")
    );
});

export const deleteTask = asyncHandler(async (req, res) =>{
    const { id } = req.params;

    const task = await Task.findById(id);

    if(!task){
        throw new ApiError(404, "Task not found")
    }
    
    await Task.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, "Task deleted successfully")
    );

});

export const getAllTasks = asyncHandler(async(req, res) =>{

    const tasks = await Task.find();

    return res.status(200).json(
        new ApiResponse(200, tasks, "Tasks fetched successfully")
    );

});

export const getTaskById = asyncHandler(async (req, res)=>{
    if (!req.user?._id) {
        throw new ApiError(401, "User not authenticated or ID not found");
    }

    const task = await Task.find({
        assignedUserId: req.user._id
    });

    if (task.length === 0) {
        throw new ApiError(404, "Task not found");
    }

    return res.status(200).json(
        new ApiResponse(200, task, "Task fetched successfully")
    );

});

export const markAsDone = asyncHandler(async (req, res)=>{
    const {id} = req.params;
    const task = await Task.findById(id);
    if(!task){
        throw new ApiError(404, "Task not found");
    }
    task.status = "done";
    await task.save();
    return res.status(200).json(
        new ApiResponse(200, task, "Task marked as done successfully")
    );

});