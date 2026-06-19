import { User } from "../models/user.model.js";
import { ProjectSummery } from "../models/timeLog.model.js";
import Project from "../models/project.model.js";
import { AdminPanel } from "../models/adminpanel.js";
import loginTime from "../models/loginTime.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendPasswordResetEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access tokens");
    }
};

export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password -refreshToken").sort({ createdAt: -1 })
    return res.status(200).json(
        new ApiResponse(200, users, "Users fetched successfully")
    )
})

export const getAllUsersAndId = asyncHandler(async (req, res) => {
    const users = await User.find({ role: "employee" }).select("name _id");

    if (!users) {
        throw new ApiError(404, "Users not found");
    }

    return res.status(200).json(
        new ApiResponse(200, users, "Users fetched successfully")
    )
})

export const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if ([name, email, password].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields (name, email, password) are required");
    }

    const existedUser = await User.findOne({ email });

    if (existedUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role || "employee"
    });


    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "User registration failed");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});

export const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password || email.trim() === "" || password.trim() === "") {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    const loginRecord = await loginTime.create({
        user: user._id,
        login: new Date()
    });

    const summaries = await ProjectSummery.find({
        userId: user._id
    });

    const projectNamesMap = {};
    let totalHours = 0;

    for (const summ of summaries) {
        projectNamesMap[summ.project] = summ.totalTime;
        totalHours += Number(summ.totalTime || 0);
    }

    let adminPanel;
    try {
        adminPanel = await AdminPanel.create({
            userId: user._id,
            loginTime: new Date(),
            name: user.name,
            email: user.email,
            ProjectNames: projectNamesMap,
            totalHoursWorked: totalHours
        });

    } catch (err) {
        console.error("AdminPanel save error:", err.message);
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                    loginRecord
                },
                "User logged in successfully"
            )
        );
});

export const logoutUser = asyncHandler(async (req, res) => {
    // Update the logout time in the active loginTime record
    const session = await loginTime.findOneAndUpdate(
        {
            user: req.user._id,
            logOut: null,
            status: "login"
        },
        {
            $set: {
                logOut: new Date(),
                status: "logout"
            }
        },
        {
            sort: { login: -1 },
            returnDocument: "after",
        }
    );

    const userlogout = await AdminPanel.findOneAndUpdate(
        {
            userId: req.user._id,
            logoutTime: null,

        },
        {
            $set: {
                logoutTime: new Date(),

            }
        },
        {
            sort: { loginTime: -1 },
            returnDocument: "after",
        }
    );


    if (!session) {
        throw new ApiError(404, "No active login session found");
    }

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// ─── STEP 1: Request password reset — sends OTP to email ─────────────────────
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email || email.trim() === "") {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        // Return generic message to avoid user enumeration
        return res.status(200).json(
            new ApiResponse(200, {}, "If this email is registered, an OTP has been sent.")
        );
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing (so plain OTP is never in the DB)
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Store hashed OTP and set 15-minute expiry
    user.passwordResetToken = hashedOtp;
    user.passwordResetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
        await sendPasswordResetEmail(user.email, otp);
    } catch (err) {
        // Rollback token if email fails
        user.passwordResetToken = null;
        user.passwordResetExpiry = null;
        await user.save({ validateBeforeSave: false });
        throw new ApiError(500, "Failed to send OTP email. Please try again.");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "OTP sent to your email. Valid for 15 minutes.")
    );
});


export const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "Email, OTP, and new password are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters");
    }
    // Hash the incoming OTP to compare with stored hash
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
        email: email.toLowerCase(),
        passwordResetToken: hashedOtp,
        passwordResetExpiry: { $gt: new Date() }, // not expired
    });

    if (!user) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successfully. Please log in with your new password.")
    );
});

export const getDashboard = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "User not authenticated or ID not found");
    }

    const user = await User.findById(req.user._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const projectQuery = user.role === "admin"
        ? {}
        : { assignedUser: user._id };

    const totalProjects = await Project.countDocuments(projectQuery);

    const summaries = await ProjectSummery.find({ userId: user._id });
    const totalHours = summaries.reduce(
        (acc, summary) => acc + Number(summary.totalTime || 0),
        0
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                name: user.name,
                email: user.email,
                role: user.role,
                totalProjects,
                totalHours,
            },
            "Dashboard data fetched successfully"
        )
    );
});

export const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.role === "admin") {
        throw new ApiError(403, "Admin users cannot be deleted");
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json(
        new ApiResponse(200, {}, "User deleted successfully")
    );
});

export const logHistory = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "User not authenticated or ID not found");
    }
    const logHistories = await loginTime.find({ user: req.user._id });

    if (!logHistories) {
        throw new ApiError(404, "No login histories found");
    }

    return res.status(200).json(
        new ApiResponse(200, logHistories, "Log histories fetched successfully")
    );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})
