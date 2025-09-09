import express from "express";
import { getWater, addWater, resetWater } from "../controllers/waterController.js";
import { protect } from "../middlewares/authMiddleware.js"; // 👈 update path if needed

const router = express.Router();

router.get("/", protect, getWater);
router.post("/add", protect, addWater);
router.post("/reset", protect, resetWater);

export default router;
