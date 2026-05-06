import { randomBytes } from "node:crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

import {
  OK,
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
} from "../utils/statusCode.js";
import ProjectInvite from "../models/projectInvite.js";

export const inviteMemberToProject = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Member email is required",
      });
    }

    if (!req.project) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Project not found",
      });
    }

    const normalizedEmail = email.toLowerCase();

    if (normalizedEmail === req.user.email) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "You are already part of this project",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      const alreadyMember = req.project.members.find(
        (member) =>
          member.user.toString() === existingUser._id.toString()
      );

      if (alreadyMember) {
        return res.status(BAD_REQUEST).json({
          success: false,
          message: "User is already a member",
        });
      }
    }

    const existingInvite = await ProjectInvite.findOne({
      email: normalizedEmail,
      project: req.project._id,
      status: "pending",
    });

    if (existingInvite) {
      return res.status(BAD_REQUEST).json({
        success: false,
        message: "Invitation already sent",
      });
    }

    const inviteToken = randomBytes(32).toString("hex");

    const invite = await ProjectInvite.create({
      email: normalizedEmail,
      project: req.project._id,
      invitedBy: req.user._id,
      token: inviteToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const inviteLink = `${process.env.CLIENT_URL}/invite/${invite.token}`;

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Project Invitation",
        html: `
          <h2>Project Invitation</h2>
          <p>You have been invited to join a project.</p>
          <a href="${inviteLink}">Join Project</a>
          <p>This link expires in 24 hours.</p>
        `,
      });
    } catch (err) {
      console.error("Email error:", err.message);
    }

    return res.status(OK).json({
      success: true,
      message: "Invitation sent successfully",
    });

  } catch (error) {
    console.error("Invite Member Error:", error);

    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Unable to send invitation",
    });
  }
};