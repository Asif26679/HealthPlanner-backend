import express from "express";
import { generateDiet } from "../controllers/dietController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Auto-generate diet
router.post("/generate", protect, generateDiet);

export default router;
