import express from 'express'
import {createDiet,deleteDiet,getDietById,getMyDiet,updateDiet} from '../controllers/dietController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router();

router.post("/", protect, createDiet); 
router.get("/", protect, getMyDiet);        
router.get("/:id", protect, getDietById);    
router.delete("/:id", protect, deleteDiet);
router.put('/:id',protect,updateDiet)

export default router;