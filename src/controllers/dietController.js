import Diet from '../models/dietModel.js';

// Helper to calculate total macros
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

// Create a new diet plan
export const createDiet = async (req, res) => {
  const { title, meals } = req.body;
  try {
    const totals = calculateTotals(meals);

    const diet = await Diet.create({
      user: req.user._id,
      title,
      meals,
      totalCalories: totals.totalCalories,
    });

    res.status(200).json({
      ...diet.toObject(),
      totalProtein: totals.totalProtein,
      totalCarbs: totals.totalCarbs,
      totalFats: totals.totalFats,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: "Can't create diet" });
  }
};

// Get all diets for logged-in user
export const getMyDiet = async (req, res) => {
  try {
    const diets = await Diet.find({ user: req.user._id });
    const dietsWithTotals = diets.map((diet) => {
      const totals = calculateTotals(diet.meals);
      return {
        ...diet.toObject(),
        totalProtein: totals.totalProtein,
        totalCarbs: totals.totalCarbs,
        totalFats: totals.totalFats,
      };
    });
    res.json(dietsWithTotals);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: "Can't get user diet" });
  }
};

// Get a single diet by ID
export const getDietById = async (req, res) => {
  try {
    const diet = await Diet.findById(req.params.id);
    if (!diet) return res.status(404).json({ message: "Diet Not Found!!!" });

    if (diet.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const totals = calculateTotals(diet.meals);

    res.json({
      ...diet.toObject(),
      totalProtein: totals.totalProtein,
      totalCarbs: totals.totalCarbs,
      totalFats: totals.totalFats,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: "Cannot get diet by id" });
  }
};

// Update the diet
export const updateDiet = async (req, res) => {
  const { id } = req.params;
  const { title, meals } = req.body;
  try {
    const diet = await Diet.findOne({ _id: id, user: req.user._id });
    if (!diet) return res.status(404).json({ success: false, message: "Diet not found" });

    diet.title = title || diet.title;
    diet.meals = meals || diet.meals;

    const totals = calculateTotals(diet.meals);
    diet.totalCalories = totals.totalCalories;

    const updatedDiet = await diet.save();

    res.status(200).json({
      ...updatedDiet.toObject(),
      totalProtein: totals.totalProtein,
      totalCarbs: totals.totalCarbs,
      totalFats: totals.totalFats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Can't update diet" });
  }
};

// Delete Diet
export const deleteDiet = async (req, res) => {
  try {
    const diet = await Diet.findById(req.params.id);
    if (!diet) return res.status(404).json({ message: "Diet not found" });

    if (diet.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await diet.deleteOne();
    res.json({ message: "Diet deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Can't delete the diet" });
  }
};
