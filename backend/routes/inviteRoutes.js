import express from "express"
import { protect } from "../middleware/authMiddleware.js"
import { getInviteByToken, acceptProjectInvitation } from "../controllers/projectController.js"

const router = express.Router()

router.get("/:token", getInviteByToken)
router.post("/accept", protect, acceptProjectInvitation)

export default router
