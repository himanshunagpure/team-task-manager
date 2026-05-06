import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";

import connectDatabase from "./config/db.js";

import authRouter from "./routes/authRoutes.js";
import projectRouter from "./routes/projectRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";
import inviteRouter from "./routes/inviteRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";

const app = express();

connectDatabase();
app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);


// Health Route
app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "Server is running successfully",
    });
  }
);


// API Routes
app.use(
  "/api/auth",
  authRouter
);

app.use(
  "/api/projects",
  projectRouter
);


app.use(
  "/api/tasks",
  taskRouter
);

app.use(
  "/api/dashboard",
  dashboardRouter
);

app.use(
  "/api/invites",
  inviteRouter
);

app.use(
  "/api/notifications",
  notificationRouter
);

// Start Server
const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on port ${PORT}`
    );
  }
);