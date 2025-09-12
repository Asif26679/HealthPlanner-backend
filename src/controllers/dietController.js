// import Diet from "../models/dietModel.js";
// import { foods } from "../utils/foodData.js";

// // Helper: calculate totals of foods in a meal
// const calculateMealTotals = (mealFoods) => {
//   return mealFoods.reduce(
//     (totals, food) => {
//       totals.calories += food.calories || 0;
//       totals.protein += food.protein || 0;
//       totals.carbs += food.carbs || 0;
//       totals.fats += food.fats || 0;
//       return totals;
//     },
//     { calories: 0, protein: 0, carbs: 0, fats: 0 }
//   );
// };

// // Helper: pick random foods for a meal to match target calories
// const pickFoodsForMeal = (targetCalories) => {
//   const mealFoods = [];
//   let remainingCalories = targetCalories;

//   while (remainingCalories > 50) {
//     const randomFood = foods[Math.floor(Math.random() * foods.length)];
//     if (randomFood.calories <= remainingCalories) {
//       mealFoods.push(randomFood);
//       remainingCalories -= randomFood.calories;
//     } else {
//       break;
//     }
//   }

//   return mealFoods;
// };

// // Generate daily diet
// export const generateDiet = async (req, res) => {
//   try {
//     if (!req.user) return res.status(401).json({ message: "Not authorized" });

//     const { age, weight, height, gender, activityLevel } = req.body;
//     if (!age || !weight || !height || !activityLevel)
//       return res.status(400).json({ message: "All fields are required" });

//     // Delete old diets for this user (optional)
//     await Diet.deleteMany({ user: req.user._id });

//     // 1️⃣ Calculate BMR
//     let bmr;
//     if (gender === "male") {
//       bmr = 10 * weight + 6.25 * height - 5 * age + 5;
//     } else {
//       bmr = 10 * weight + 6.25 * height - 5 * age - 161;
//     }

//     // 2️⃣ Apply activity factor (TDEE)
//     const activityMultiplier = {
//       sedentary: 1.2,
//       lightly: 1.375,
//       moderate: 1.55,
//       active: 1.725,
//       very: 1.9,
//     };
//     const totalCalories = Math.round(
//       bmr * (activityMultiplier[activityLevel] || 1.2)
//     );

//     // 3️⃣ Split calories into meals
//     const mealDistribution = {
//       Breakfast: 0.3,
//       Lunch: 0.35,
//       Dinner: 0.3,
//       Snacks: 0.05,
//     };

//     const mealTypes = Object.keys(mealDistribution);
//     const meals = mealTypes.map((mealName) => {
//       const targetCalories = Math.round(totalCalories * mealDistribution[mealName]);
//       const mealFoods = pickFoodsForMeal(targetCalories);
//       const totals = calculateMealTotals(mealFoods);
//       return {
//         name: mealName,
//         foods: mealFoods,
//         calories: totals.calories,
//         protein: totals.protein,
//         carbs: totals.carbs,
//         fats: totals.fats,
//       };
//     });

//     // 4️⃣ Save diet to DB
//     const diet = await Diet.create({
//       user: req.user._id,
//       title: `Daily Diet Plan (${new Date().toLocaleDateString()})`,
//       meals,
//       totalCalories: meals.reduce((sum, meal) => sum + meal.calories, 0),
//     });

//     res.status(201).json(diet);
//   } catch (err) {
//     console.error("Error generating diet:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

// // Get all diets
// export const getDiets = async (req, res) => {
//   try {
//     const diets = await Diet.find({ user: req.user._id }).sort({ createdAt: -1 });
//     res.status(200).json(diets);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error fetching diets" });
//   }
// };

// // Delete diet
// export const deleteDiet = async (req, res) => {
//   try {
//     const diet = await Diet.findById(req.params.id);
//     if (!diet) return res.status(404).json({ message: "Diet not found" });

//     if (diet.user.toString() !== req.user._id.toString())
//       return res.status(401).json({ message: "Not authorized" });

//     await Diet.findByIdAndDelete(req.params.id);
//     res.json({ message: "Diet deleted successfully" });
//   } catch (err) {
//     console.error("❌ Delete Diet Error:", err.message);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


import Diet from "../models/dietModel.js";
import Food from "../models/Food.js";

// Helper: calculate totals
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

// Pick foods from DB
const pickFoodsForMeal = async (targetCalories, mealType) => {
  const mealFoods = [];
  let remainingCalories = targetCalories;

  // Get foods of that meal type
  const allFoods = await Food.find({ type: mealType });

  while (remainingCalories > 50 && allFoods.length > 0) {
    const randomFood = allFoods[Math.floor(Math.random() * allFoods.length)];
    if (randomFood.calories <= remainingCalories) {
      mealFoods.push(randomFood);
      remainingCalories -= randomFood.calories;
    } else {
      break;
    }
  }

  return mealFoods;
};

// Generate Diet
export const generateDiet = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const { age, weight, height, gender, activityLevel } = req.body;
    if (!age || !weight || !height || !activityLevel)
      return res.status(400).json({ message: "All fields are required" });

    // Delete old diets
    await Diet.deleteMany({ user: req.user._id });

    // 1️⃣ Calculate BMR
    let bmr;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // 2️⃣ Activity multiplier
    const activityMultiplier = {
      sedentary: 1.2,
      lightly: 1.375,
      moderate: 1.55,
      active: 1.725,
      very: 1.9,
    };
    const totalCalories = Math.round(
      bmr * (activityMultiplier[activityLevel] || 1.2)
    );

    // 3️⃣ Split into meals
    const mealDistribution = {
      Breakfast: 0.3,
      Lunch: 0.35,
      Dinner: 0.3,
      Snacks: 0.05,
    };

    const meals = await Promise.all(
      Object.keys(mealDistribution).map(async (mealName) => {
        const targetCalories = Math.round(totalCalories * mealDistribution[mealName]);
        const mealFoods = await pickFoodsForMeal(targetCalories, mealName.toLowerCase());
        const totals = calculateMealTotals(mealFoods);
        return {
          name: mealName,
          foods: mealFoods,
          calories: totals.calories,
          protein: totals.protein,
          carbs: totals.carbs,
          fats: totals.fats,
        };
      })
    );

    // 4️⃣ Save diet
    const diet = await Diet.create({
      user: req.user._id,
      title: `Daily Diet Plan (${new Date().toLocaleDateString()})`,
      meals,
      totalCalories: meals.reduce((sum, meal) => sum + meal.calories, 0),
    });

    res.status(201).json(diet);
  } catch (err) {
    console.error("Error generating diet:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get all diets
export const getDiets = async (req, res) => {
  try {
    const diets = await Diet.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(diets);
  } catch (err) {
    res.status(500).json({ message: "Error fetching diets" });
  }
};

// Delete diet
export const deleteDiet = async (req, res) => {
  try {
    const diet = await Diet.findById(req.params.id);
    if (!diet) return res.status(404).json({ message: "Diet not found" });
    if (diet.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: "Not authorized" });

    await Diet.findByIdAndDelete(req.params.id);
    res.json({ message: "Diet deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
