import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
  getUserInfo,
  refreshAccessToken,
  uploadProfileImage,
} from "../controllers/authController.js";
import upload from "../middlewares/uploadMiddleware.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/register").post(upload.single("profileImageUrl"), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(protectedRoute, logoutUser);
router.get("/getuser", protectedRoute, getUserInfo);
router.route("/refresh").post(refreshAccessToken);
router.post(
  "/upload",
  protectedRoute,
  upload.single("profileImageUrl"),
  uploadProfileImage,
);

export default router;
