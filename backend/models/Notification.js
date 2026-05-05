import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "project_invitation",
        "task_assigned",
        "comment_reply",
      ],
      default: "project_invitation",
    },

    relatedInvite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectInvite",
    },

    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "unread",
        "read",
      ],
      default: "unread",
    },

    actionTaken: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "denied",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;
