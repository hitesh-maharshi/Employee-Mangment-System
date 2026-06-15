import Project from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { AdminPanel } from "../models/adminpanel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUserInfo = asyncHandler(async (req, res)=>{
    const allUserInfo = await AdminPanel.find()

    if(allUserInfo.length == 0){
        throw new ApiError(404, "No user info found");
    }

    return res.status(200).json(
        new ApiResponse(200, allUserInfo, "User info fetched successfully")
    );

});