import Water from "../models/Water.js";

// Get today's water intake
export const getWater = async (req, res) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);

    let water = await Water.findOne({ user: req.user.id, date: today });

    if (!water) {
      water = await Water.create({ user: req.user.id, amount: 0 });
    }

    res.json(water);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Add water
export const addWater = async (req, res) => {
  try {
    const { amount } = req.body;
    const today = new Date().setHours(0, 0, 0, 0);

    let water = await Water.findOne({ user: req.user.id, date: today });

    if (!water) {
      water = await Water.create({ user: req.user.id, amount });
    } else {
      water.amount += amount;
      await water.save();
    }

    res.json(water);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Reset water
export const resetWater = async (req, res) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);

    let water = await Water.findOne({ user: req.user.id, date: today });

    if (water) {
      water.amount = 0;
      await water.save();
    } else {
      water = await Water.create({ user: req.user.id, amount: 0 });
    }

    res.json(water);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
