import { Router } from "express";
import { getUserInfo } from "../controllers/Adminpanel.js";
import { verifyJWT } from "../midelware/authMidleware.js";

const router = Router();

router.route("/get-user-info").get(verifyJWT, getUserInfo);
// router.route("/view-user-info/:userId").get(verifyJWT, viewUserInfo);

export default router;
