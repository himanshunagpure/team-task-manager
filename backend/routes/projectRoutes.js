import express from "express";

import {
  createProject,
  getMyProjects,
  inviteMemberToProject,
    acceptProjectInvitation,
  removeProjectMember,
} from "../controllers/projectController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";



import {
  checkProjectAdmin,
} from "../middleware/projectRoleMiddleware.js";



const projectRouter =
  express.Router();


// Create project
projectRouter.post(
  "/create",
  protect,
  createProject
);


// Get projects
projectRouter.get(
  "/my-projects",
  protect,
  getMyProjects
);


// Invite member
projectRouter.post(
  "/:projectId/invite",
  protect,
  checkProjectAdmin,
  inviteMemberToProject
);

projectRouter.post(
  "/invite/:token/accept",
  protect,
  acceptProjectInvitation
);

// Remove member from project
projectRouter.delete(
  "/:projectId/members/:memberId",
  protect,
  checkProjectAdmin,
  removeProjectMember
);

export default projectRouter;