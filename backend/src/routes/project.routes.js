import { Router } from "express";
import { createProject, getAllProject, updateProject, deleteProject, getMyProjects } from "../controllers/project.js";

import { verifyJWT } from "../midelware/authMidleware.js";

const router = Router();

router.route("/addProject").post(verifyJWT, createProject);
router.route("/getAllProject").get(verifyJWT, getAllProject);
router.route("/updateProject").put(verifyJWT, updateProject);
router.route("/deleteProject/:id").delete(verifyJWT, deleteProject);
router.route("/my-projects").get(verifyJWT, getMyProjects);


export default router;