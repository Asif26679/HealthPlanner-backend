import express from "express";
import { generateDiet,getDiets,deleteDiet } from "../controllers/dietController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Auto-generate diet
router.post("/generate", protect, generateDiet);
router.get("/", protect, getDiets);
router.delete('/:id',deleteDiet)
export default router;
