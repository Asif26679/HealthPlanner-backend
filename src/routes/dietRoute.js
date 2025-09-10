import express from "express";
import { generateDiet,getDiets } from "../controllers/dietController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Auto-generate diet
router.post("/generate", protect, generateDiet);
router.get("/", protect, getDiets);
export default router;
