import express from "express";
import {
  loginUser,
  registerUser,
  getUserInfo,
  uploadProfileImage,
} from "../controllers/authController.js";
import upload from "../middlewares/uploadMiddleware.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/register").post(upload.single("profileImageUrl"), registerUser);
router.route("/login").post(loginUser);
router.get("/getUser", protectedRoute, getUserInfo);
router.post(
  "/upload",
  protectedRoute,
  upload.single("profileImageUrl"),
  uploadProfileImage
);

export default router;
