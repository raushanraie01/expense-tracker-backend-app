import mongoose from "mongoose";

const IncomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    icon: {
      type: String,
    },
    source: {
      type: String,
      required: true,
      enum: ["Salary", "Business", "Freelance", "Investment", "Other"],
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

IncomeSchema.index({ userId: 1, date: -1 });

const Income = mongoose.model("Income", IncomeSchema);
export default Income;
