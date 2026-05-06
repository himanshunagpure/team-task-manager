import Project from "../models/Project.js";
import { randomBytes } from "crypto"; // ✅ FIXED
import mongoose from "mongoose";
import ProjectInvite from "../models/ProjectInvite.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

import { sendEmail } from "../utils/sendEmail.js";

import {
  OK,
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  FORBIDDEN, //  FIXED (you were missing this)
} from "../utils/statusCode.js";

/* ================= CREATE PROJECT ================= */
export const createProject = async (req, res) => {
  try {
    const { projectName, description } = req.body;

    if (!projectName) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Project name is required",
      });
    }

    const existingProject = await Project.findOne({
      projectName,
      createdBy: req.user._id,
    });

    if (existingProject) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "You already have a project with this name",
      });
    }

    const project = await Project.create({
      projectName,
      description,
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: "admin" }],
    });

    return res.status(CREATED).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Create Project Error:", error);
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Unable to create project",
    });
  }
};

/* ================= GET MY PROJECTS ================= */
export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      "members.user": req.user._id,
    })
      .populate("createdBy", "fullName email")
      .populate("members.user", "fullName email")
      .sort({ createdAt: -1 });

    return res.status(OK).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("Get Projects Error:", error);
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Unable to fetch projects",
    });
  }
};

/* ================= GET PROJECT BY ID ================= */
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("createdBy", "fullName email")
      .populate("members.user", "fullName email");

    if (!project) {
      return res.status(NOT_FOUND).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(OK).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Get Project Error:", error);
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Unable to fetch project",
    });
  }
};

/* ================= INVITE MEMBER ================= */
export const inviteMemberToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Member email is required",
      });
    }

    const normalizedEmail = email.toLowerCase();

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(NOT_FOUND).json({
        success: false,
        message: "Project not found",
      });
    }

    if (normalizedEmail === req.user.email.toLowerCase()) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "You are already part of this project",
      });
    }

    const existingInvite = await ProjectInvite.findOne({
      email: normalizedEmail,
      project: projectId,
      status: "pending",
    });

    if (existingInvite) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Invitation already sent",
      });
    }

    // FIXED
    const inviteToken = randomBytes(32).toString("hex");

    const invite = await ProjectInvite.create({
      email: normalizedEmail,
      project: projectId,
      invitedBy: req.user._id,
      role: "member",
      token: inviteToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const inviteLink = `${process.env.CLIENT_URL}/invite?token=${invite.token}`;

    const registeredUser = await User.findOne({ email: normalizedEmail });

    if (registeredUser) {
      await Notification.create({
        recipient: registeredUser._id,
        type: "project_invitation",
        relatedInvite: invite._id,
        relatedProject: projectId,
        message: `You have been invited to join ${project.projectName}`,
        status: "unread",
        actionTaken: "pending",
      });
    }

    await sendEmail({
      to: normalizedEmail,
      subject: "Project Invitation",
      html: `
        <h2>Team Invitation</h2>
        <p>You have been invited to join ${project.projectName}</p>
        <a href="${inviteLink}">Accept Invitation</a>
        <p>Expires in 24 hours</p>
      `,
    });

    return res.status(OK).json({
      success: true,
      message: "Invitation sent successfully",
    });
  } catch (error) {
    console.error("Invite Error:", error);
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Unable to send invitation",
    });
  }
};

/* ================= ACCEPT INVITE ================= */
export const acceptProjectInvitation = async (req, res) => {
  try {
    const token = req.body.token || req.params.token || req.query.token;

    if (!token) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Invitation token is required",
      });
    }

    const invite = await ProjectInvite.findOne({ token });

    if (!invite) {
      return res.status(NOT_FOUND).json({
        success: false,
        message: "Invitation not found",
      });
    }

    if (invite.expiresAt < new Date()) {
      invite.status = "expired";
      await invite.save();

      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Invitation expired",
      });
    }

    if (invite.email !== req.user.email.toLowerCase()) {
      return res.status(FORBIDDEN).json({
        success: false,
        message: "Invalid invite",
      });
    }

    const project = await Project.findById(invite.project);

    project.members.push({
      user: req.user._id,
      role: invite.role || "member",
    });

    await project.save();

    invite.status = "accepted";
    await invite.save();

    return res.status(OK).json({
      success: true,
      message: "Joined project successfully",
    });
  } catch (error) {
    console.error("Accept Invite Error:", error);
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Unable to accept invitation",
    });
  }
};