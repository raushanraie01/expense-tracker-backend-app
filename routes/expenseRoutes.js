import express from "express";

import {
  addExpense,
  getAllExpense,
  deleteExpense,
  downloadExpenseExcel,
} from "../controllers/expenseController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.route("/get").get(protectedRoute, getAllExpense);
router.route("/add").post(protectedRoute, addExpense);
router.route("/:id").delete(protectedRoute, deleteExpense);
router.get("/downloadExcel", protectedRoute, downloadExpenseExcel);

export default router;
