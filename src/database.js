const mongoose=require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/project")

const schema=new mongoose.Schema({
    username:{
        type:String, 
        required: true,
        unique: true
    },
    password:{
        type:String,
        required:true
    }
})

const coll = new mongoose.model("logindatabases",schema)

module.exports=coll