import { Router } from "express";
import { verifyJWT } from "../midelware/authMidleware.js";
import { saveTime, getUserTime, deleteTime, userProjectSummery } from "../controllers/timelog.js";

const router = Router();

router.route("/saveTime").post(verifyJWT, saveTime);
router.route("/getUserTime").get(verifyJWT, getUserTime);
router.route("/ProjectSummery").get(verifyJWT, userProjectSummery);
router.route("/deleteTime/:id").delete(verifyJWT, deleteTime);
export default router;