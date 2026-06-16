import { Router } from "express";
import { verifyJWT } from "../midelware/authMidleware.js";
import { saveTime, getUserTime, deleteTimeLog, userProjectSummery } from "../controllers/timelog.js";

const router = Router();

router.route("/saveTime").post(verifyJWT, saveTime);
router.route("/getUserTime").get(verifyJWT, getUserTime);
router.route("/ProjectSummery").get(verifyJWT, userProjectSummery);
router.route("/deleteTime/:id").delete(verifyJWT, deleteTimeLog);
export default router;