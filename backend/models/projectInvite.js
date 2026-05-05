import mongoose from "mongoose";

const projectInviteSchema =
  new mongoose.Schema(
    {
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      },

      project: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "Project",
        required: true,
      },

      invitedBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
      },

      role: {
        type: String,
        enum: ["member", "admin"],
        default: "member",
      },

      token: {
        type: String,
        required: true,
        unique: true,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "accepted",
          "expired",
        ],
        default: "pending",
      },

      expiresAt: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: true,
    }
  );

const ProjectInvite =
  mongoose.model(
    "ProjectInvite",
    projectInviteSchema
  );

export default ProjectInvite;