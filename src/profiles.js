const mongoose=require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/project")

const schema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    fullname:{
        type:String, 
        maxLength: 50,
        required: true
    },
    address1:{
        type:String,
        maxLength: 100,
        required:true
    },
    address2:{
        type:String,
        maxLength: 100,
        required:false
    },
    city:{
        type:String,
        maxLength: 100,
        required:true
    },
    states:{
        type:String,
        required:true
    },
    zip:{
        type:String,
        minLength: 5,
        maxLength: 9,
        required:true
    },

})

const coll = new mongoose.model("profilemanagement",schema)

module.exports=coll