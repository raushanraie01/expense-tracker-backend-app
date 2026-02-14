import Expense from "../models/ExpenseModel.js";
import XLSX from "xlsx";

//Add New Expense
export async function addExpense(req, res) {
  try {
    const id = req.user._id;
    const { icon, category, amount, notes, date } = req.body;
    if (!category || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newExpense = await Expense.create({
      icon,
      category,
      amount,
      notes,
      ...(date && { date: new Date(date) }),
      userId: id,
    });

    res.status(201).json({
      message: "New Income Created",
      error: "",
      newExpense,
    });
  } catch (error) {
    return res.status(404).json({
      error: error.message,
      message: "",
    });
  }
}

//Get All Expenses
export async function getAllExpense(req, res) {
  try {
    const userId = req.user._id;
    const expenses = await Expense.find({ userId }).sort({ date: -1 });
    res.status(200).json({
      message: "All incomes fetched successfully",
      error: "",
      length: expenses.length,
      data: expenses,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "",
      error: error.message,
    });
  }
}

//Delete Specific Expense
export async function deleteExpense(req, res) {
  try {
    const userId = req.user._id;
    const expenseId = req.params.id;

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    if (expense.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this income",
      });
    }

    await expense.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Income deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete income",
      error: error.message,
    });
  }
}

//Download ExcelSheet of Expense
export async function downloadExpenseExcel(req, res) {
  try {
    const userId = req.user._id;
    const expense = await Expense.find({ userId }).sort({ date: -1 }).lean(); //best practice for excel

    const excelData = expense.map((item) => {
      return {
        Category: item.category,
        Amount: item.amount,
        Notes: item.notes || "",
        Date: new Date(item.date).toLocaleDateString(),
      };
    });
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expense");

    //  Convert workbook to buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader("Content-Disposition", "attachment; filename=expense.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.status(200).send(excelBuffer);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send expense ExcelSheet",
      error: error.message,
    });
  }
}
