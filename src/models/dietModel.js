import mongoose,{Schema} from "mongoose";

const dietSchema=new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    title:{
        type:String,
        required:true
    },
    meals:[
        {
            name:{
                type:String,
                required:true
            },
            items:[
                {type:String}
            ],
            calories:{
                type:Number,
                default:0
            }
        }, 
    ],
    totalCalories:{
        type:Number,
        default:0
    }

},{timestamps:true})

const Diet=mongoose.model("Diet",dietSchema)

export default Diet;
