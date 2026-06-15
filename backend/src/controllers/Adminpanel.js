import Project from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { AdminPanel } from "../models/adminpanel.js";
import { Task } from "../models/task.model.js";
import { Report } from "../models/report.model.js";
import { ProjectSummery } from "../models/timeLog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUserInfo = asyncHandler(async (req, res) => {
    let targetDate = new Date();

    if (req.query.date) {
        const parsedDate = new Date(req.query.date);
        if (!isNaN(parsedDate.getTime())) {
            targetDate = parsedDate;
        }
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const allUserInfo = await AdminPanel.find({
        loginTime: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    if (allUserInfo.length === 0) {
        throw new ApiError(404, "No user info found for today");
    }

    return res.status(200).json(
        new ApiResponse(200, allUserInfo, "User info fetched successfully")
    );

});

export const viewUserInfo = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.params.id || req.query.userId;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    let targetDate = new Date();
    if (req.query.date) {
        const parsedDate = new Date(req.query.date);
        if (!isNaN(parsedDate.getTime())) {
            targetDate = parsedDate;
        }
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch reports for today
    const reports = await Report.find({
        userId,
        created_at: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    // Fetch tasks created today
    const tasks = await Task.find({
        assignedUserId: userId,
        created_at: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    // Fetch project summaries for today
    const projectSummary = await ProjectSummery.find({
        userId,
        $or: [
            { date: { $gte: startOfDay, $lte: endOfDay } },
            { createdAt: { $gte: startOfDay, $lte: endOfDay } }
        ]
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                user,
                reports,
                tasks,
                projectSummary
            },
            "User info details for today fetched successfully"
        )
    );
});