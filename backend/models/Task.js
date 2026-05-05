import mongoose from "mongoose";

const taskSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: [
          true,
          "Task title is required",
        ],
        trim: true,
        minlength: 2,
        maxlength: 100,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      project: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "Project",
        required: true,
      },

      assignedTo: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
      },

      createdBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
      },

      priority: {
        type: String,
        enum: [
          "low",
          "medium",
          "high",
        ],
        default: "medium",
      },

      status: {
        type: String,
        enum: [
          "todo",
          "in-progress",
          "done",
        ],
        default: "todo",
      },

      dueDate: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );


// Faster dashboard queries
taskSchema.index({
  project: 1,
  assignedTo: 1,
  status: 1,
});

const Task =
  mongoose.model(
    "Task",
    taskSchema
  );

export default Task;