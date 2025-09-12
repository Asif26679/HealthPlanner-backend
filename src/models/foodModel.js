import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["breakfast", "lunch", "dinner", "snacks"], required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Food = mongoose.model("Food", foodSchema);
export default Food;
