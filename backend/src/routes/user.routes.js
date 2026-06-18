import { Router } from "express";
import { registerUser, loginUser, logoutUser, getAllUsersAndId, getAllUsers, forgotPassword, resetPassword, logHistory, deleteUser, getDashboard, refreshAccessToken } from "../controllers/user.js";
import { verifyJWT } from "../midelware/authMidleware.js";
import { isAdmin } from "../midelware/adminMidelware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);


router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

// Secured routes

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/getUserAndId").get(verifyJWT, getAllUsersAndId);
router.route("/getallUsers").get(verifyJWT, getAllUsers);
router.route("/dashboard").get(verifyJWT, getDashboard);
router.route("/deleteUser/:id").delete(verifyJWT, isAdmin, deleteUser);
router.route("/refresh-token").post(refreshAccessToken)
router.route("/logHistory").get(verifyJWT, logHistory);

export default router;
