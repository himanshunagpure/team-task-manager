import jwt from "jsonwebtoken";

import User from "../models/User.js";

import {
  UNAUTHORIZED,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
} from "../utils/statusCode.js";

export const protect = async (
  req,
  res,
  next
) => {
  try {
    let token;

    const authHeader =
      req.headers.authorization;

    // Check bearer token
    if (
      authHeader &&
      authHeader.startsWith(
        "Bearer "
      )
    ) {
      token =
        authHeader.split(
          " "
        )[1];
    }

    if (!token) {
      return res.status(
        UNAUTHORIZED
      ).json({
        success: false,
        message:
          "Authentication token is missing",
      });
    }

    // Verify token
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    // Fetch user
    const user =
      await User.findById(
        decoded.userId
      );

    if (!user) {
      return res.status(
        UNAUTHORIZED
      ).json({
        success: false,
        message:
          "User not found",
      });
    }

    if (req.path !== '/verify' && !user.isActive) {
      return res.status(
        FORBIDDEN
      ).json({
        success: false,
        message:
          "Your account is inactive",
      });
    }

    // Attach logged-in user
    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Auth Middleware Error:",
      error
    );

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(
        UNAUTHORIZED
      ).json({
        success: false,
        message:
          "Invalid or expired authentication token",
      });
    }

    return res.status(
      INTERNAL_SERVER_ERROR
    ).json({
      success: false,
      message:
        "Authentication failed",
    });
  }
};