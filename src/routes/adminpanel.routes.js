import { Router } from "express";
import { getUserInfo } from "../controllers/Adminpanel.js";
import { verifyJWT } from "../midelware/authMidleware.js";
import { isAdmin } from "../midelware/adminMidelware.js";

const router = Router();

router.route("/get-user-info").get(verifyJWT, isAdmin, getUserInfo);
// router.route("/view-user-info/:userId").get(verifyJWT, viewUserInfo);

export default router;
