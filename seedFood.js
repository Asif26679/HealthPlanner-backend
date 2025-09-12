import mongoose from "mongoose";
import dotenv from "dotenv";
import Food from "./src/models/foodModel.js";

dotenv.config();

const foods = [
  // 🍳 Breakfast
  { name: "Boiled Eggs", type: "breakfast", calories: 155, protein: 13, carbs: 1, fats: 11 },
  { name: "Oatmeal", type: "breakfast", calories: 150, protein: 5, carbs: 27, fats: 3 },
  { name: "Toast with Peanut Butter", type: "breakfast", calories: 190, protein: 8, carbs: 20, fats: 10 },

  // 🍛 Lunch
  { name: "Grilled Chicken Breast", type: "lunch", calories: 284, protein: 53, carbs: 0, fats: 6 },
  { name: "Brown Rice", type: "lunch", calories: 215, protein: 5, carbs: 45, fats: 2 },
  { name: "Mixed Veggies", type: "lunch", calories: 80, protein: 3, carbs: 15, fats: 1 },

  // 🍲 Dinner
  { name: "Baked Salmon", type: "dinner", calories: 280, protein: 25, carbs: 0, fats: 18 },
  { name: "Quinoa", type: "dinner", calories: 222, protein: 8, carbs: 39, fats: 4 },
  { name: "Steamed Broccoli", type: "dinner", calories: 55, protein: 5, carbs: 11, fats: 0 },

  // 🍎 Snacks
  { name: "Apple", type: "snacks", calories: 95, protein: 0, carbs: 25, fats: 0 },
  { name: "Protein Shake", type: "snacks", calories: 200, protein: 20, carbs: 10, fats: 5 },
];

const seedFoods = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Food.deleteMany();
    await Food.insertMany(foods);
    console.log("✅ Foods seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding foods:", err);
    process.exit(1);
  }
};

seedFoods();
