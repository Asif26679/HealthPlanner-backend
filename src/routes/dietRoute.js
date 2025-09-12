import express from "express";
import { generateDiet,getDiets,deleteDiet, getFoods } from "../controllers/dietController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Auto-generate diet
router.post("/generate", protect, generateDiet);
router.get("/", protect, getDiets);
router.delete('/:id',protect, deleteDiet)
router.get('/food',getFoods)
export default router;
