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
// export const generateDiet = async (req, res) => {
//   try {
//     const { age, weight, height, gender, activityLevel } = req.body;

//     if (!age || !weight || !height ||  !activityLevel) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     // 1️⃣ Calculate BMR
//     let bmr;
//     if (gender === "male") {
//       bmr = 10 * weight + 6.25 * height - 5 * age + 5;
//     } else {
//       bmr = 10 * weight + 6.25 * height - 5 * age - 161;
//     }

//     // 2️⃣ Adjust for activity
//     const activityMultiplier = {
//       sedentary: 1.2,
//       lightly: 1.375,
//       moderate: 1.55,
//       active: 1.725,
//       very: 1.9,
//     };
//     const calories = Math.round(bmr * (activityMultiplier[activityLevel] || 1.2));

//     // 3️⃣ Split calories into 4 meals
//     const mealCalories = Math.floor(calories / 4);
//     const mealNames = ["Breakfast", "Lunch", "Snack", "Dinner"];
//     const meals = mealNames.map((name) => {
//       const selectedFoods = pickFoodsForMeal(mealCalories);
//       const totals = calculateTotals(selectedFoods);
//       return {
//         name,
//         calories: totals.totalCalories,
//         protein: totals.totalProtein,
//         carbs: totals.totalCarbs,
//         fats: totals.totalFats,
//         foods: selectedFoods, // store actual food items
//       };
//     });

//     // 4️⃣ Save to database
//     const diet = await Diet.create({
//       user: req.user._id,
//       title: `Auto-Generated Diet (${new Date().toLocaleDateString()})`,
//       meals,
//       totalCalories: calories,
//     });

//     res.status(200).json({
//       ...diet.toObject(),
//       ...calculateTotals(meals),
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error generating diet" });
//   }
// };

export const getDiets = async (req, res) => {
  try {
    const diets = await Diet.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(diets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching diets" });
  }
};
  // Deleted Diet

export const deleteDiet = async (req, res) => {
  try {
    const diet = await Diet.findById(req.params.id);

    if (!diet) {
      return res.status(404).json({ message: "Diet not found" });
    }

    // Ensure only the owner can delete
    if (diet.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await Diet.findByIdAndDelete(req.params.id);

    res.json({ message: "Diet deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Diet Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Generate daily diet
const calculateMealTotals = (mealFoods) => {
  return mealFoods.reduce(
    (totals, food) => {
      totals.calories += food.calories || 0;
      totals.protein += food.protein || 0;
      totals.carbs += food.carbs || 0;
      totals.fats += food.fats || 0;
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
};

// Helper to get random foods for a meal
const getSuggestedFoods = (mealType, count = 3) => {
  const filtered = foods.filter(
    (f) => f.type.toLowerCase() === mealType.toLowerCase()
  );
  // Shuffle and pick count foods
  return filtered.sort(() => 0.5 - Math.random()).slice(0, count);
};

// Generate daily diet
export const generateDiet = async (req, res) => {
  try {
    const { age, weight, height, gender, activityLevel } = req.body;
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    // Optional: delete old diets for the user
    await Diet.deleteMany({ user: req.user._id });

    const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];
    const meals = mealTypes.map((mealName) => {
      const mealFoods = getSuggestedFoods(mealName, 3); // get at least 3 foods
      const totals = calculateMealTotals(mealFoods);
      return {
        name: mealName,
        foods: mealFoods,
        calories: totals.calories,
        protein: totals.protein,
        carbs: totals.carbs,
        fats: totals.fats,
      };
    });

    // Total calories of all meals
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

    // Create diet object
    const diet = await Diet.create({
      user: req.user._id,
      title: "Daily Diet Plan",
      meals,
      totalCalories,
    });

    res.status(201).json(diet);
  } catch (err) {
    console.error("Error generating diet:", err);
    res.status(500).json({ message: err.message });
  }
};