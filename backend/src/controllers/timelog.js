import { TimeLog } from "../models/timeLog.model.js";
import { ProjectSummery } from "../models/timeLog.model.js";
import { AdminPanel } from "../models/adminpanel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const saveTime = asyncHandler(async (req, res) => {
    const { project, totalTime, description } = req.body;


    const totaltime = Number(totalTime);


   if (!project || isNaN(totaltime) || totaltime <= 0) {
    throw new ApiError(400, "Valid project and totalTime are required");
    }

    let userProjectSummary;

    const existing = await ProjectSummery.findOne({
    userId: req.user._id,
    project
    });

    if (existing) {
        existing.totalTime += totaltime;
        if (description) {
            existing.description = description;
        }

        userProjectSummary = await existing.save();
    } else {
        userProjectSummary = await ProjectSummery.create({
            userId: req.user._id,
            project,
            totalTime:totaltime,
            description
        });
    }

    // Fetch all project summaries for this user to calculate totalHoursWorked and map ProjectNames
    const summaries = await ProjectSummery.find({ userId: req.user._id });
    const projectNamesMap = {};
    let totalHours = 0;

    for (const summ of summaries) {
        projectNamesMap[summ.project] = summ.totalTime;
        totalHours += summ.totalTime;
    }

    const adminPanel = await AdminPanel.findOneAndUpdate(
    {
        userId: req.user._id
    },
    {
        $set: {
                totalHoursWorked: totalHours,
                ProjectNames: projectNamesMap
        }
    },
    {
        sort: { loginTime: -1 },
        returnDocument: 'after',
        runValidators: true
    }
    );

    const projectRecord = await TimeLog.create({
        user: req.user._id,
        project,
        description,
        totalTime,
    });
    return res.status(200).json({
        success: true,
        message: "Time saved",
        projectRecord
    });
});

export const getUserTime = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "User not authenticated or ID not found");
    }

    const userId = req.user._id;
    const timeLogs = await TimeLog.find({ user: userId });

    return res.status(200).json(
        new ApiResponse(200, timeLogs, "Time logs fetched successfully")
    );
});

export const userProjectSummery = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "User not authenticated or ID not found");
    }
    const userId = req.user._id;
    const projectSummery = await ProjectSummery.find({ userId: userId });
    return res.status(200).json(
        new ApiResponse(200, projectSummery, "Project summery fetched successfully")
    );
});


export const deleteTimeLog = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const timelog = await TimeLog.findById(id);

    if (!timelog) {
        throw new ApiError(404, "TimeLog not found");
    }

    await TimeLog.findByIdAndDelete(id);

    const summary = await ProjectSummery.findOne({
        userId: timelog.user,
        project: timelog.project
    });

    if (summary) {
        summary.totalTime -= timelog.totalTime;

        if (summary.totalTime <= 0) {
            await ProjectSummery.findByIdAndDelete(summary._id);
        } else {
            await summary.save();
        }
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "TimeLog deleted successfully"
        )
    );
});