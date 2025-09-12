import Diet from "../models/dietModel.js";
import foods from "../utils/foodData.js";

// ------------------------
// 📌 Helpers
// ------------------------

// 1️⃣ Calculate totals for foods in a meal
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

// 2️⃣ Calculate overall totals for all meals
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

// 3️⃣ Pick foods for a meal based on meal type & calorie target
const pickFoodsForMeal = (mealType, targetCalories) => {
  const filteredFoods = foods.filter(
    (food) => food.type.toLowerCase() === mealType.toLowerCase()
  );

  const mealFoods = [];
  let remainingCalories = targetCalories;

  while (remainingCalories > 50 && filteredFoods.length > 0) {
    const randomFood =
      filteredFoods[Math.floor(Math.random() * filteredFoods.length)];

    if (randomFood.calories <= remainingCalories) {
      mealFoods.push(randomFood);
      remainingCalories -= randomFood.calories;
    } else {
      // skip and retry
      continue;
    }
  }

  // Fallback: if nothing was added, at least add one random food
  if (mealFoods.length === 0 && filteredFoods.length > 0) {
    mealFoods.push(filteredFoods[0]);
  }

  return mealFoods;
};

// ------------------------
// 📌 Controllers
// ------------------------

// Generate diet dynamically
export const generateDiet = async (req, res) => {
  try {
    const { age, weight, height, gender, activityLevel } = req.body;

    if (!age || !weight || !height || !gender || !activityLevel) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    // 1️⃣ Calculate BMR (Mifflin-St Jeor Equation)
    let bmr;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // 2️⃣ Apply Activity Multiplier
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

    // 3️⃣ Split calories into meals (40% lunch, 25% breakfast, 25% dinner, 10% snacks)
    const mealDistribution = {
      Breakfast: 0.25,
      Lunch: 0.4,
      Dinner: 0.25,
      Snacks: 0.1,
    };

    const mealTypes = Object.keys(mealDistribution);

    const meals = mealTypes.map((mealName) => {
      const targetCalories = Math.round(
        totalCalories * mealDistribution[mealName]
      );
      const mealFoods = pickFoodsForMeal(mealName, targetCalories);
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

    // 4️⃣ Create Diet in DB
    await Diet.deleteMany({ user: req.user._id }); // clear old diets

    const diet = await Diet.create({
      user: req.user._id,
      title: `Daily Diet Plan (${new Date().toLocaleDateString()})`,
      meals,
      totalCalories,
    });

    res.status(201).json({
      ...diet.toObject(),
      ...calculateTotals(meals), // totals for frontend
    });
  } catch (error) {
    console.error("❌ Error generating diet:", error);
    res.status(500).json({ message: "Error generating diet" });
  }
};

// Get all diets
export const getDiets = async (req, res) => {
  try {
    const diets = await Diet.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(diets);
  } catch (error) {
    console.error("❌ Error fetching diets:", error);
    res.status(500).json({ message: "Error fetching diets" });
  }
};

// Delete diet
export const deleteDiet = async (req, res) => {
  try {
    const diet = await Diet.findById(req.params.id);

    if (!diet) {
      return res.status(404).json({ message: "Diet not found" });
    }

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
