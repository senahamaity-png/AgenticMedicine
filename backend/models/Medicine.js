const mongoose=require("mongoose");
const medicineSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
         },
         stock:{
            type:Number,
            required:true,
            min:0,
            default:0,
         },
         manufacturer:{
            type:String,
            required:true,
         },
         image:{
            type:String,
            default:""
         },
         prescriptionRequired:{
            type:Boolean,
            default:false,
         }
    },
    {
        timestamps:true,
    }
)
module.exports=mongoose.model("Medicine",medicineSchema);