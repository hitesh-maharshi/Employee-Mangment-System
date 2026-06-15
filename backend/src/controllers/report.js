import { User } from "../models/user.model.js";
import { Report } from "../models/report.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createReport = asyncHandler(async (req, res) => {
    const { report } = req.body;
    if (!report || String(report).trim() === "") {
        throw new ApiError(400, "Report is required");
    }
    if (!req.user._id) {
        throw new ApiError(400, "User ID is required");
    }

    const newReport = await Report.create({
        userId : req.user._id,
        report,
    });

    return res.status(201).json(
        new ApiResponse(201, newReport, "Report created successfully")
    );
});

const getAllReports = asyncHandler(async (req, res) => {
    const reports = await Report.find();
    return res.status(200).json(
        new ApiResponse(200, reports, "Reports fetched successfully")
    );
});

const getUserReports = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const reports = await Report.findById(id);
    if(!reports){
        throw new ApiError(404, "No reports found");
    }
    return res.status(200).json(
        new ApiResponse(200, reports, "Reports fetched successfully")
    );
});


export { createReport, getAllReports, getUserReports };