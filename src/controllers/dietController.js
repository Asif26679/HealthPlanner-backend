import Diet from "../models/dietModel.js";
import { foods } from "../utils/foodData.js";

// Helper to calculate totals
const calculateTotals = (meals) => {
  return meals.reduce(
    (totals, meal) => {
      totals.totalCalories += meal.calories || 0;
      totals.totalProtein += meal.protein || 0;
      totals.totalCarbs += meal.carbs || 0;
      totals.totalFats += meal.fats || 0;
      return totals;
    },
    { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 }
  );
};

// Helper to pick random foods for a meal
const pickFoodsForMeal = (targetCalories) => {
  const mealFoods = [];
  let remainingCalories = targetCalories;

  while (remainingCalories > 50) {
    const randomFood = foods[Math.floor(Math.random() * foods.length)];
    if (randomFood.calories <= remainingCalories) {
      mealFoods.push(randomFood);
      remainingCalories -= randomFood.calories;
    } else {
      break;
    }
  }

  return mealFoods;
};

// Auto-generate diet
export const generateDiet = async (req, res) => {
  try {
    const { age, weight, height, gender, activityLevel } = req.body;

    if (!age || !weight || !height || !gender || !activityLevel) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 1️⃣ Calculate BMR
    let bmr;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // 2️⃣ Adjust for activity
    const activityMultiplier = {
      sedentary: 1.2,
      lightly: 1.375,
      moderate: 1.55,
      active: 1.725,
      very: 1.9,
    };
    const calories = Math.round(bmr * (activityMultiplier[activityLevel] || 1.2));

    // 3️⃣ Split calories into 4 meals
    const mealCalories = Math.floor(calories / 4);
    const mealNames = ["Breakfast", "Lunch", "Snack", "Dinner"];
    const meals = mealNames.map((name) => {
      const selectedFoods = pickFoodsForMeal(mealCalories);
      const totals = calculateTotals(selectedFoods);
      return {
        name,
        calories: totals.totalCalories,
        protein: totals.totalProtein,
        carbs: totals.totalCarbs,
        fats: totals.totalFats,
        foods: selectedFoods, // store actual food items
      };
    });

    // 4️⃣ Save to database
    const diet = await Diet.create({
      user: req.user._id,
      title: `Auto-Generated Diet (${new Date().toLocaleDateString()})`,
      meals,
      totalCalories: calories,
    });

    res.status(200).json({
      ...diet.toObject(),
      ...calculateTotals(meals),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating diet" });
  }
};
