import { Router } from "express";
import { verifyJWT } from "../midelware/authMidleware.js";
import { createTask, deleteTask, getAllTasks, getTaskById, updateTask } from "../controllers/task.js";

const router = Router();

router.route("/addTask").post(verifyJWT, createTask);
router.route("/getAllTasks").get(verifyJWT, getAllTasks);
router.route("/updateTask/:id").put(verifyJWT, updateTask);
router.route("/deleteTask/:id").delete(verifyJWT, deleteTask);
router.route("/getTaskById").get(verifyJWT, getTaskById);

export default router;