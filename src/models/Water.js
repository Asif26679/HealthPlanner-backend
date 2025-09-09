
import mongoose from "mongoose";

const waterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: () => new Date().setHours(0, 0, 0, 0), // start of day
  },
  amount: {
    type: Number,
    default: 0, // ml
  },
});

export default mongoose.model("Water", waterSchema);
