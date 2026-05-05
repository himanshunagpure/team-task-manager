import Notification from "../models/Notification.js";
import ProjectInvite from "../models/ProjectInvite.js";
import Project from "../models/Project.js";
import {
  OK,
  BAD_REQUEST,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
} from "../utils/statusCode.js";

export const getNotifications =
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          recipient:
            req.user._id,
        })
          .populate(
            "relatedInvite",
            "email token status expiresAt"
          )
          .populate(
            "relatedProject",
            "projectName"
          )
          .populate(
            "relatedTask",
            "title"
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
          notifications.length,
        data: notifications,
      });
    } catch (error) {
      console.error(
        "Get Notifications Error:",
        error
      );

      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to fetch notifications",
      });
    }
  };


export const markAsRead =
  async (req, res) => {
    try {
      const {
        notificationId,
      } = req.params;

      const notification =
        await Notification.findById(
          notificationId
        );

      if (!notification) {
        return res.status(
          NOT_FOUND
        ).json({
          success: false,
          message:
            "Notification not found",
        });
      }

  
      if (
        notification.recipient.toString() !==
        req.user._id.toString()
      ) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "Unauthorized",
        });
      }

      notification.status =
        "read";

      await notification.save();

      return res.status(
        OK
      ).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      console.error(
        "Mark as Read Error:",
        error
      );

      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to update notification",
      });
    }
  };

export const respondToInvitation =
  async (req, res) => {
    try {
      const {
        notificationId,
      } = req.params;

      const {
        action,
      } = req.body;

    
      if (
        !["accepted", "denied"]
          .includes(action)
      ) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "Invalid action. Must be 'accepted' or 'denied'",
        });
      }

      const notification =
        await Notification.findById(
          notificationId
        );

      if (!notification) {
        return res.status(
          NOT_FOUND
        ).json({
          success: false,
          message:
            "Notification not found",
        });
      }

     
      if (
        notification.recipient.toString() !==
        req.user._id.toString()
      ) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "Unauthorized",
        });
      }

      
      if (
        notification.actionTaken !==
        "pending"
      ) {
        return res.status(
          BAD_REQUEST
        ).json({
          success: false,
          message:
            "Invitation already responded",
        });
      }

      if (
        action ===
        "accepted"
      ) {
       
        const invite =
          await ProjectInvite.findById(
            notification.relatedInvite
          );

        if (!invite) {
          return res.status(
            NOT_FOUND
          ).json({
            success: false,
            message:
              "Invite not found",
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
          return res.status(
            BAD_REQUEST
          ).json({
            success: false,
            message:
              "Invitation link has expired",
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

        // Check if already member
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

       
        project.members.push({
          user:
            req.user._id,

          role:
            invite.role || "member",
        });

        await project.save();

     
        invite.status =
          "accepted";

        await invite.save();

       
        notification.actionTaken =
          "accepted";
        notification.status =
          "read";

        await notification.save();

        return res.status(
          OK
        ).json({
          success: true,
          message:
            "You joined the project successfully",
          data: {
            projectId:
              project._id,
          },
        });
      } else {
        // action === 'denied'

       
        const invite =
          await ProjectInvite.findById(
            notification.relatedInvite
          );

        if (
          invite &&
          invite.status === "pending"
        ) {
          invite.status =
            "denied";

          await invite.save();
        }

       
        notification.actionTaken =
          "denied";
        notification.status =
          "read";

        await notification.save();

        return res.status(
          OK
        ).json({
          success: true,
          message:
            "Invitation denied",
        });
      }
    } catch (error) {
      console.error(
        "Respond to Invitation Error:",
        error
      );

      return res.status(
        INTERNAL_SERVER_ERROR
      ).json({
        success: false,
        message:
          "Unable to process your response",
      });
    }
  };
