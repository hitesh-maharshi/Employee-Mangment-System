import { Router } from "express";
import { createReport, getAllReports, getUserReports, updateReport, deleteReport } from "../controllers/report.js";
import { verifyJWT } from "../midelware/authMidleware.js";

const router = Router();

router.route("/addReport").post(verifyJWT, createReport);
router.route("/getAllReports").get(verifyJWT, getAllReports);
router.route("/getUserReports/:id").get(verifyJWT, getUserReports);
router.route("/updateReport/:id").put(verifyJWT, updateReport);
router.route("/deleteReport/:id").delete(verifyJWT, deleteReport);
 export default router;