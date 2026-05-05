import express from "express";

import {
  createTask,
  getMyTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../controllers/taskController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

import {
  checkProjectAdmin,
} from "../middleware/projectRoleMiddleware.js";

import {
  checkTaskAccess,
  checkAssignedMember,
} from "../middleware/taskMiddleware.js";

const taskRouter =
  express.Router();


// Create task
taskRouter.post(
  "/project/:projectId",
  protect,
  checkProjectAdmin,
  createTask
);


// Get assigned tasks
taskRouter.get(
  "/my-tasks",
  protect,
  getMyTasks
);


// Admin update task
taskRouter.put(
  "/:taskId",
  protect,
  checkTaskAccess,
  updateTask
);


// Member update status
taskRouter.patch(
  "/:taskId/status",
  protect,
  checkTaskAccess,
  checkAssignedMember,
  updateTaskStatus
);


// Admin delete task
taskRouter.delete(
  "/:taskId",
  protect,
  checkTaskAccess,
  deleteTask
);

export default taskRouter;