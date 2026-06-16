import { Router } from "express";
import { registerUser, loginUser, logoutUser, getAllUsersAndId, getAllUsers, forgotPassword, resetPassword, logHistory, deleteUser, getDashboard } from "../controllers/user.js";
import { verifyJWT } from "../midelware/authMidleware.js";
import { isAdmin } from "../midelware/adminMidelware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);


router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

// Secured routes
router.use(verifyJWT);
router.route("/logout").post(logoutUser);
router.route("/getUserAndId").get(getAllUsersAndId);
router.route("/getallUsers").get(getAllUsers);
router.route("/dashboard").get(getDashboard);
router.route("/deleteUser/:id").delete(isAdmin, deleteUser);

router.route("/logHistory").get(logHistory);

export default router;
