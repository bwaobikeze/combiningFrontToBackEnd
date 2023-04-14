const mongoose=require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/project")

const schema=new mongoose.Schema({
    gallonsreq:{
        type:Number,
        required: true
    },
    deliveryaddress:{
        type:String,
        maxLength: 100,
        required:false
    },
    deliverydate:{
        type:String,
        required:false
    },
    suggestedpricepergallon:{
        type:Number,
        required:false
    },
    totalamountdue:{
        type:Number,
        required:false
    },

})

const coll = new mongoose.model("profilemanagement",schema)

module.exports=coll


