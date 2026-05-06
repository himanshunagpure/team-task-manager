import Task from "../models/Task.js";
import Project from "../models/Project.js";

import {
  OK,
  CREATED,
  BAD_REQUEST,
  FORBIDDEN,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} from "../utils/statusCode.js";



export const createTask =
  async (req, res) => {
    try {
      const {
        projectId,
      } = req.params;

      const {
        title,
        description,
        assignedTo,
        priority,
        dueDate,
      } = req.body;

      if (
        !title ||
        !assignedTo ||
        !dueDate
      ) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "Required fields are missing",
        });
      }

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

      const task =
        await Task.create({
          title,
          description,
          project:
            projectId,
          assignedTo,
          createdBy:
            req.user._id,
          priority,
          dueDate,
        });

      return res.status(
        CREATED
      ).json({
        success: true,
        message:
          "Task created successfully",
        data: task,
      });
    } catch (error) {
      console.error(
        "Create Task Error:",
        error
      );

      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to create task",
      });
    }
  };



// Get My Tasks
// =====================================
export const getMyTasks =
  async (req, res) => {
    try {
      const tasks =
        await Task.find({
          assignedTo:
            req.user._id,
        })
          .populate(
            "project",
            "projectName"
          )
          .sort({
            createdAt:
              -1,
          });

      return res.status(
        OK
      ).json({
        success: true,
        count:
          tasks.length,
        data: tasks,
      });
    } catch (error) {
      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to fetch tasks",
      });
    }
  };


export const updateTask =
  async (req, res) => {
    try {
      const task =
        await Task.findByIdAndUpdate(
          req.params.taskId,
          req.body,
          {
            new: true,
            runValidators:
              true,
          }
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

      return res.status(
        OK
      ).json({
        success: true,
        message:
          "Task updated successfully",
        data: task,
      });
    } catch (error) {
      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to update task",
      });
    }
  };

export const updateTaskStatus =
  async (req, res) => {
    try {
      const { status } =
        req.body;

      req.task.status =
        status;

      await req.task.save();

      return res.status(
        OK
      ).json({
        success: true,
        message:
          "Task status updated successfully",
        data:
          req.task,
      });
    } catch (error) {
      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to update status",
      });
    }
  };



export const deleteTask =
  async (req, res) => {
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

      await task.deleteOne();

      return res.status(
        OK
      ).json({
        success: true,
        message:
          "Task deleted successfully",
      });
    } catch (error) {
      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to delete task",
      });
    }
  };