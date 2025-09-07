import Diet from '../models/dietModel.js'

// Create a new diet plan

export const createDiet=async (req,res)=>{
     const {title,meals}=req.body;
     try {
        const totalCalories=meals.reduce((acc,meal)=>{
           return acc+(meal.calories || 0)
        },0);

        const diet= await Diet.create({
            user:req.user._id,
            title,
            meals,
            totalCalories
        });
        res.status(200).json(diet)
     } catch (error) {
        return res.status(400).json({
            success:false,
            message:"Can't create diet"
        })
     }
}

// Get all diets for logged in user

export const getMyDiet=async(req,res)=>{
    try {
        const diet=await Diet.find({user:req.user._id})
        res.json(diet)
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"Cann't get user diet"
        })
    }

}

//Get a single diet by id

export const getDietById=async(req,res)=>{
    try {
        const diet=await Diet.findById(req.params.id);
        if(!diet){
            return res.status(404).json({message:"Diet Not Found!!!"})
        }
         // Ensure only owner can access
         if (diet.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
          }
          res.json(diet)
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"Cannot get diet by id"
        })
    }
}

// Update the diet

export const updateDiet=async(req,res)=>{
    const { id } = req.params;
  const { title, meals } = req.body;
    try {
        const diet=await Diet.findOne({_id:id,user:req.user._id})
        if (!diet) {
            return res.status(404).json({ success: false, message: "Diet not found" });
          }
           // Recalculate calories if meals are updated
    const totalCalories = meals
    ? meals.reduce((acc, meal) => acc + (meal.calories || 0), 0)
    : diet.totalCalories;

  diet.title = title || diet.title;
  diet.meals = meals || diet.meals;
  diet.totalCalories = totalCalories;

  const updatedDiet = await diet.save();
  res.status(200).json(updatedDiet);
    } catch (error) {
        return res.status(500).json({
            success:false,
            messgae:"Cann't update"
        })
    }
}

// Delete Diet

export const deleteDiet = async (req, res) => {
    try {
      const diet = await Diet.findById(req.params.id); // fixed variable name
      if (!diet) {
        return res.status(404).json({ message: "Diet not found" });
      }
  
      if (diet.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Not authorized" });
      }
  
      await diet.deleteOne(); // ✅ correct
      res.json({ message: "Diet deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Can't delete the diet",
      });
    }
  };