import { Router } from "express";
import { verifyJWT } from "../midelware/authMidleware.js";
import { isAdmin } from "../midelware/adminMidelware.js";
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask, markAsDone } from "../controllers/task.js";

const router = Router();

router.route("/addTask").post(verifyJWT, isAdmin, createTask);
router.route("/getAllTasks").get(verifyJWT, isAdmin, getAllTasks);
router.route("/updateTask/:id").put(verifyJWT, isAdmin, updateTask);
router.route("/deleteTask/:id").delete(verifyJWT, isAdmin, deleteTask);
router.route("/getTaskById").get(verifyJWT, getTaskById);
router.route("/markAsDone/:id").put(verifyJWT, markAsDone);

export default router;