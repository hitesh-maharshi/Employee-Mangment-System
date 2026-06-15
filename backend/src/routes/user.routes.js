import { Router } from "express";
import { registerUser, loginUser, logoutUser, getAllUsersAndId, getAllUsers, forgotPassword, resetPassword } from "../controllers/user.js";
import { verifyJWT } from "../midelware/authMidleware.js";

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
export default router;
