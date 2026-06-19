import Project from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createProject = asyncHandler(async (req, res) => {
    const { projectName, description, assignedUser } = req.body;

    if (!projectName || !description || !assignedUser || String(projectName).trim() === "" || String(description).trim() === "" || String(assignedUser).trim() === "") {
        throw new ApiError(400, "All fields (projectName, description, assignedUser) are required");
    }

    const user = await User.findById(assignedUser);
    if (!user) {
        throw new ApiError(404, "Assigned user not found");
    }

    const project = await Project.create({
        projectName,
        description,
        assignedUser: user._id,
        assignedUserName: user.name,
    });

    return res.status(201).json(
        new ApiResponse(201, project, "Project created successfully")
    );
});

const getAllProject = asyncHandler(async (req, res) => {
    const projects = await Project.find().sort({ created_at: -1 });

    return res.status(200).json(
        new ApiResponse(200, projects, "Projects fetched successfully")
    );
});

const updateProject = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { projectName, description, assignedUser } = req.body;

    const updateFields = {
        projectName,
        description,
        assignedUser,
    };

    if (assignedUser) {
        const user = await User.findById(assignedUser);
        if (!user) {
            throw new ApiError(404, "Assigned user not found");
        }
        updateFields.assignedUserName = user.name;
    }

    const project = await Project.findByIdAndUpdate(
        id,
        {
            $set: updateFields,
        },
        {
            returnDocument: "after", // returns updated document
            runValidators: true,
        }
    );

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return res.status(200).json(
        new ApiResponse(200, project, "Project updated successfully")
    );
});

const deleteProject = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    await Project.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Project deleted successfully")
    );
});

const getMyProjects = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "User not authenticated or ID not found");
    }

    const projects = await Project.find({
        assignedUser: req.user._id
    }).populate("assignedUser", "name email role").sort({ created_at: -1 });

    return res.status(200).json(
        new ApiResponse(200, projects, "My projects fetched successfully")
    );
});

export { createProject, updateProject, deleteProject, getAllProject, getMyProjects };