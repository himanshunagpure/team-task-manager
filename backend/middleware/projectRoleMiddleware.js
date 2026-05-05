import Project from "../models/Project.js";

import {
  FORBIDDEN,
  NOT_FOUND,
} from "../utils/statusCode.js";

export const checkProjectAdmin =
  async (
    req,
    res,
    next
  ) => {
    const project =
      await Project.findById(
        req.params.projectId
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

    const member =
      project.members.find(
        (
          item
        ) =>
          item.user.toString() ===
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
          "Only project admin can perform this action",
      });
    }

    req.project =
      project;

    next();
  };