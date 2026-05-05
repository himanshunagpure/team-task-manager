import Project from "../models/Project.js";
import crypto from "crypto";
import mongoose from "mongoose";
import ProjectInvite from "../models/ProjectInvite.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

import { sendEmail }
  from "../utils/sendEmail.js";

import {
  OK,
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} from "../utils/statusCode.js";



export const createProject =
  async (req, res) => {
    try {
      const {
        projectName,
        description,
      } = req.body;

      if (!projectName) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "Project name is required",
        });
      }

     
      const existingProject =
        await Project.findOne({
          projectName,
          createdBy:
            req.user._id,
        });

      if (existingProject) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "You already have a project with this name",
        });
      }

      const project =
        await Project.create({
          projectName,
          description,

          createdBy:
            req.user._id,

         
          members: [
            {
              user:
                req.user._id,

              role:
                "admin",
            },
          ],
        });

      return res.status(
        CREATED
      ).json({
        success: true,
        message:
          "Project created successfully",
        data: project,
      });
    } catch (error) {
      console.error(
        "Create Project Error:",
        error
      );

      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to create project",
      });
    }
  };




export const getMyProjects =
  async (req, res) => {
    try {
      const projects =
        await Project.find({
          "members.user":
            req.user._id,
        })
          .populate(
            "createdBy",
            "fullName email"
          )
          .populate(
            "members.user",
            "fullName email"
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
          projects.length,
        data: projects,
      });
    } catch (error) {
      console.error(
        "Get Projects Error:",
        error
      );

      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to fetch projects",
      });
    }
  };




export const getProjectById =
  async (req, res) => {
    try {
      const project =
        await Project.findById(
          req.params.projectId
        )
          .populate(
            "createdBy",
            "fullName email"
          )
          .populate(
            "members.user",
            "fullName email"
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

      return res.status(
        OK
      ).json({
        success: true,
        data: project,
      });
    } catch (error) {
      console.error(
        "Get Project Error:",
        error
      );

      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to fetch project",
      });
    }
  };


  export const inviteMemberToProject =
  async (req, res) => {
    try {
      const {
        projectId,
      } = req.params;

      const {
        email,
      } = req.body;

      if (!email) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "Member email is required",
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

      
      if (
        email.toLowerCase() ===
        req.user.email
      ) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "You are already part of this project",
        });
      }

      // Already invited?
      const existingInvite =
        await ProjectInvite.findOne(
          {
            email:
              email.toLowerCase(),

            project:
              projectId,

            status:
              "pending",
          }
        );

      if (
        existingInvite
      ) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "Invitation already sent to this email",
        });
      }

      // Generate invite token
      const inviteToken =
        crypto.randomBytes(
          32
        ).toString(
          "hex"
        );

      // Create invite
      const invite =
        await ProjectInvite.create(
          {
            email:
              email.toLowerCase(),

            project:
              projectId,

            invitedBy:
              req.user._id,

            role:
              "member",

            token:
              inviteToken,

            expiresAt:
              new Date(
                Date.now() +
                  24 *
                    60 *
                    60 *
                    1000
              ),
          }
        );

      
      const inviteLink =
        `${process.env.CLIENT_URL}/invite?token=${invite.token}`;

      
      const registeredUser =
        await User.findOne({
          email:
            email.toLowerCase(),
        });

      
      if (registeredUser) {
        await Notification.create({
          recipient:
            registeredUser._id,

          type:
            "project_invitation",

          relatedInvite:
            invite._id,

          relatedProject:
            projectId,

          message:
            `You have been invited to join ${project.projectName}`,

          status:
            "unread",

          actionTaken:
            "pending",
        });
      }

      // Send email
      await sendEmail({
        to: email,

        subject:
          "Project Invitation",

        html: `
          <h2>Team Invitation</h2>

          <p>
            You have been invited to join a project.
          </p>

          <a href="${inviteLink}">
            Accept Invitation
          </a>

          <p>
            Link expires in 24 hours.
          </p>
        `,
      });

      return res.status(
        OK
      ).json({
        success: true,
        message:
          "Invitation sent successfully",
      });
    } catch (error) {
      console.error(
        "Invite Error:",
        error
      );

      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to send invitation",
      });
    }
  };

  export const getInviteByToken =
  async (req, res) => {
    try {
      const { token } = req.params;

      const invite =
        await ProjectInvite.findOne(
          { token }
        ).populate(
          "project",
          "projectName"
        );

      if (!invite) {
        return res.status(
          NOT_FOUND
        ).json({
          success: false,
          message:
            "Invitation not found",
        });
      }

      if (
        invite.expiresAt <
        new Date() &&
        invite.status ===
          "pending"
      ) {
        invite.status =
          "expired";
        await invite.save();
      }

      return res.status(
        OK
      ).json({
        success: true,
        data: {
          projectId:
            invite.project?._id,
          projectName:
            invite.project?.projectName,
          invitedEmail:
            invite.email,
          status:
            invite.status,
          expiresAt:
            invite.expiresAt,
        },
      });
    } catch (error) {
      console.error(
        "Get Invite Error:",
        error
      );

      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to load invitation",
      });
    }
  };

  export const acceptProjectInvitation =
  async (req, res) => {
    try {
      const token =
        req.body.token ||
        req.params.token ||
        req.query.token;

      if (!token) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "Invitation token is required",
        });
      }

      
      const invite =
        await ProjectInvite.findOne(
          {
            token,
          }
        );

      if (!invite) {
        return res.status(
          NOT_FOUND
        ).json({
          success: false,
          message:
            "Invitation not found",
        });
      }

      
      if (
        invite.status ===
        "accepted"
      ) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "Invitation already accepted",
        });
      }

     
      if (
        invite.expiresAt <
        new Date()
      ) {
        invite.status =
          "expired";

        await invite.save();

        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "Invitation link has expired",
        });
      }

     
      if (
        invite.email.toLowerCase() !==
        req.user.email.toLowerCase()
      ) {
        return res.status(
          FORBIDDEN
        ).json({
          success: false,
          message:
            "This invitation does not belong to your account",
        });
      }

     
      const project =
        await Project.findById(
          invite.project
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

     
      const alreadyMember =
        project.members.find(
          (
            member
          ) =>
            member.user.toString() ===
            req.user._id.toString()
        );

      if (
        alreadyMember
      ) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "You are already a member of this project",
        });
      }

      project.members.push(
        {
          user:
            req.user._id,

          role:
            invite.role || "member",
        }
      );

      await project.save();

      
      invite.status =
        "accepted";

      await invite.save();

      return res.status(
        OK
      ).json({
        success: true,
        message:
          "You joined the project successfully",
        projectId:
          project._id,
      });
    } catch (error) {
      console.error(
        "Accept Invite Error:",
        error
      );

      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to accept invitation",
      });
    }
  };


export const removeProjectMember =
  async (req, res) => {
    try {
      const {
        projectId,
        memberId,
      } = req.params;

      if (!projectId || !memberId) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "Project ID and Member ID are required",
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

     
      const isAdmin =
        project.members.find(
          (
            member
          ) =>
            member.user.toString() ===
            req.user._id.toString() &&
            member.role === "admin"
        );

      if (!isAdmin) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "Only project admin can remove members",
        });
      }

    
      if (
        project.createdBy.toString() ===
        memberId
      ) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "Cannot remove project creator",
        });
      }

   
      const memberObjectId =
        new mongoose.Types.ObjectId(
          memberId
        );

      console.log(
        "Remove Member Debug:",
        {
          projectId,
          memberId,
          memberObjectIdString:
            memberObjectId.toString(),
          projectMembers:
            project.members.map(
              (m) => ({
                userId:
                  m.user.toString(),
              })
            ),
        }
      );

      const memberExists =
        project.members.find(
          (
            member
          ) =>
            member.user.toString() ===
            memberObjectId.toString()
        );

      if (!memberExists) {
        return res.status(
          NOT_FOUND
        ).json({
          success: false,
          message:
            "Member not found in this project",
        });
      }

      
      project.members =
        project.members.filter(
          (
            member
          ) =>
            member.user.toString() !==
            memberObjectId.toString()
        );

      await project.save();

      return res.status(
        OK
      ).json({
        success: true,
        message:
          "Member removed from project",
        data: project,
      });
    } catch (error) {
      console.error(
        "Remove Member Error:",
        error
      );

      if (
        error.message.includes(
          "Cast to ObjectId failed"
        )
      ) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "Invalid member ID format",
        });
      }

      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to remove member",
      });
    }
  };