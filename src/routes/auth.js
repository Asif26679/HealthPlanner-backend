import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { signupUser, loginUser,  getMe,updateName,changePassword } from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", signupUser);

router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateName);
router.put("/password", protect, changePassword);
export default router;