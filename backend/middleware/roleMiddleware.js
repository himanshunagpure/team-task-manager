import Project from "../models/Project.js";

import {
  FORBIDDEN,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} from "../utils/statusCode.js";

export const projectAdminOnly =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        projectId,
      } = req.params;

      const project =
        await Project.findById(
          projectId
        );

      if (!project) {
        return res.status(
          NOT_FOUND
        ).json({
          success: false,
          message:
            "Project not found",
        });
      }

      // Check if logged in user is project admin
      const member =
        project.members.find(
          (
            member
          ) =>
            member.user.toString() ===
            req.user._id.toString()
        );

      if (
        !member ||
        member.role !==
          "admin"
      ) {
        return res.status(
          FORBIDDEN
        ).json({
          success: false,
          message:
            "You do not have permission to perform this action",
        });
      }

      // Attach project if needed later
      req.project =
        project;

      next();
    } catch (error) {
      console.error(
        "Role Middleware Error:",
        error
      );

      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Authorization failed",
    });
    }
  };