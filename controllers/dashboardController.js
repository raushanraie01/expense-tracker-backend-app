import Income from "../models/IncomeModel.js";
import Expense from "../models/ExpenseModel.js";
import { isValidObjectId, Types } from "mongoose";

//Dashboard Data
export async function getDashboardData(req, res) {
  try {
    const userId = req.user._id;
    const userObjectId = new Types.ObjectId(String(userId));

    const incomeResult = await Income.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: "$amount" },
        },
      },
    ]);

    const expenseResult = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: "$amount" },
        },
      },
    ]);

    const last60DaysIncomeTransactions = await Income.find({
      userId,
      date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
    }).sort({ date: -1 });
    //get total income in last 60 days
    const incomeLast60Days = last60DaysIncomeTransactions.reduce(
      (sum, income) => sum + +income.amount,
      0,
    );

    //get expense transaction in last 30 days
    const last30DaysExpenseTransactions = await Expense.find({
      userId,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }).sort({ date: -1 });
    //get total expense in last 30 days
    const expenseLast30Days = last30DaysExpenseTransactions.reduce(
      (sum, expense) => sum + +expense.amount,
      0,
    );

    //Fetch last 5 transactions
    const lastTransactions = [
      ...(await Income.find({ userId }).sort({ date: -1 }).limit(5)).map(
        (txn) => ({ ...txn.toObject(), type: "income" }),
      ),
      ...(await Expense.find({ userId }).sort({ date: -1 }).limit(5)).map(
        (txn) => ({
          ...txn.toObject(),
          type: "expense",
        }),
      ),
    ].sort((a, b) => a.date - b.date); //sort latest first

    //final response
    res.status(200).json({
      success: true,
      message: "Successfully fetched Dashboard Data",
      totalIncome: incomeResult[0]?.totalIncome || 0,
      totalExpense: expenseResult[0]?.totalExpense || 0,
      balance:
        (incomeResult[0]?.totalIncome || 0) -
        (expenseResult[0]?.totalExpense || 0),
      last30DaysExpenses: {
        total: expenseLast30Days,
        transactions: last30DaysExpenseTransactions,
      },
      last60DaysIncome: {
        total: incomeLast60Days,
        transactions: last60DaysIncomeTransactions,
      },
      lastTransactions,
    });
  } catch (error) {
    console.error("Dashboard totals error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch totals",
      error: error.message,
    });
  }
}
