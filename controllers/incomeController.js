import Income from "../models/IncomeModel.js";
import XLSX from "xlsx";

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

    res.status(200).json({
      message: "All incomes fetched successfully",
      error: "",
      length: incomes.length,
      data: incomes,
    });
  } catch (error) {
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
    return res.status(500).json({
      success: false,
      message: "Failed to delete income",
      error: error.message,
    });
  }
}

export async function downloadIncomeExcel(req, res) {
  try {
    const userId = req.user.id;
    const income = await Income.find({ userId }).sort({ date: -1 }).lean(); //best practice for excel

    const excelData = income.map((item) => {
      return {
        Source: item.source,
        Amount: item.amount,
        Notes: item.notes || "",
        Date: new Date(item.date).toLocaleDateString(),
      };
    });
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Income");

    //  Convert workbook to buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader("Content-Disposition", "attachment; filename=income.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.status(200).send(excelBuffer);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send income ExcelSheet",
      error: error.message,
    });
  }
}
