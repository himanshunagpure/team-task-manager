import Task from "../models/Task.js";

import {
  OK,
  INTERNAL_SERVER_ERROR,
} from "../utils/statusCode.js";

export const getDashboardStats =
  async (req, res) => {
    try {
      // Total tasks
      const totalTasks =
        await Task.countDocuments();

      // Overdue tasks
      const overdueTasks =
        await Task.countDocuments(
          {
            dueDate: {
              $lt:
                new Date(),
            },

            status: {
              $ne:
                "done",
            },
          }
        );

      // Tasks by status
      const tasksByStatus =
        await Task.aggregate(
          [
            {
              $group: {
                _id:
                  "$status",

                count:
                  {
                    $sum: 1,
                  },
              },
            },
          ]
        );

      // Tasks per user
      const tasksPerUser =
        await Task.aggregate(
          [
            {
              $group: {
                _id:
                  "$assignedTo",

                count:
                  {
                    $sum: 1,
                  },
              },
            },
          ]
        );

      return res.status(
        OK
      ).json({
        success: true,

        data: {
          totalTasks,

          overdueTasks,

          tasksByStatus,

          tasksPerUser,
        },
      });
    } catch (error) {
      console.error(
        "Dashboard Error:",
        error
      );

      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to fetch dashboard stats",
      });
    }
  };