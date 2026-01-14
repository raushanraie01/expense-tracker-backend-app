import Income from "../models/IncomeModel.js";

export async function addIncome(req, res) {
  //here user is logged in , so we have user inside request object
  const id = req.user.id;
  const { icon, source, amount, notes, date } = req.body;
  if (!source || !amount) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newIncome = await Income.create({
    icon,
    source,
    amount,
    notes,
    ...(date && { date: new Date(date) }),
    userId: id,
  });

  res.status(201).json({
    message: "New Income Created",
    error: "",
    newIncome,
  });
}

export async function getAllIncome(req, res) {
  try {
    const userId = req.user.id;
    const incomes = await Income.find({ userId }).sort({ date: -1 });
    console.log(incomes);
    res.status(200).json({
      message: "All incomes fetched successfully",
      error: "",
      length: incomes.length,
      incomes,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "",
      error: error.message,
    });
  }
}

export async function deleteIncome(req, res) {
  try {
    const incomeId = req.params.id;
    const userId = req.user.id;

    const income = await Income.findById(incomeId);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    if (income.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this income",
      });
    }

    await income.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Income deleted successfully",
    });
  } catch (error) {
    console.error("Delete income error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete income",
      error: error.message,
    });
  }
}

export async function downloadIncomeExcel() {}
