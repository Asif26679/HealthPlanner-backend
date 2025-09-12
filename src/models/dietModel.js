import mongoose from "mongoose";

const foodItemSchema = mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
  name: { type: String, required: true },
  type: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fats: { type: Number, required: true },
});

const mealSchema = mongoose.Schema({
  name: { type: String, required: true },
  items: [foodItemSchema], // ✅ Subdocument array
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
});

const dietSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    meals: [mealSchema],
    totalCalories: Number,
    totalProtein: Number,
    totalCarbs: Number,
    totalFats: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Diet", dietSchema);

