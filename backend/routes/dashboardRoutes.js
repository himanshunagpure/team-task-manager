import express from "express";

import {
  getDashboardStats,
} from "../controllers/dashboardController.js";

import {
  protect,
} from "../middleware/authMiddleware.js";

const dashboardRouter =
  express.Router();

dashboardRouter.get(
  "/stats",
  protect,
  getDashboardStats
);

export default dashboardRouter;