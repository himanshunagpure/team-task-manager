import mongoose from "mongoose";

const projectMemberSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
      },

      role: {
        type: String,
        enum: [
          "admin",
          "member",
        ],
        default: "member",
      },

      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
    {
      _id: false,
    }
  );

const projectSchema =
  new mongoose.Schema(
    {
      projectName: {
        type: String,
        required: [
          true,
          "Project name is required",
        ],
        trim: true,
        minlength: 2,
        maxlength: 100,
      },

      description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      createdBy: {
        type:
          mongoose.Schema.Types
            .ObjectId,
        ref: "User",
        required: true,
      },

      members: [
        projectMemberSchema,
      ],

      status: {
        type: String,
        enum: [
          "active",
          "archived",
        ],
        default: "active",
      },
    },
    {
      timestamps: true,
    }
  );

// Prevent duplicate project names for same user
projectSchema.index({
  projectName: 1,
  createdBy: 1,
});

const Project =
  mongoose.model(
    "Project",
    projectSchema
  );

export default Project;