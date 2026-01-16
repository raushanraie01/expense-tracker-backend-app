import express from "express";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { getDashboardData } from "../controllers/dashboardController.js";
const router = express.Router();

router.get("/", protectedRoute, getDashboardData);

export default router;
