import express from "express";

import {
  addIncome,
  getAllIncome,
  deleteIncome,
  downloadIncomeExcel,
} from "../controllers/incomeController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.route("/get").get(protectedRoute, getAllIncome);
router.route("/add").post(protectedRoute, addIncome);
router.route("/:id").delete(protectedRoute, deleteIncome);
router.get("/downloadExcel", protectedRoute, downloadIncomeExcel);
export default router;
