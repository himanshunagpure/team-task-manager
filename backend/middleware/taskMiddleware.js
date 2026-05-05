import Task from "../models/Task.js";

import {
  FORBIDDEN,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} from "../utils/statusCode.js";

export const checkTaskAccess =
  async (
    req,
    res,
    next
  ) => {
    try {
      const task =
        await Task.findById(
          req.params.taskId
        );

      if (!task) {
        return res.status(
          NOT_FOUND
        ).json({
          success: false,
          message:
            "Task not found",
        });
      }

      req.task =
        task;

      next();
    } catch (error) {
      console.error(
        "Task Middleware Error:",
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


// Only assigned member can update task status
export const checkAssignedMember =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (
        req.task.assignedTo.toString() !==
        req.user._id.toString()
      ) {
        return res.status(
          FORBIDDEN
        ).json({
          success: false,
          message:
            "You can only update your assigned task",
        });
      }

      next();
    } catch (error) {
      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Authorization failed",
      });
    }
  };