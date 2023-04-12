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
    },
    fullname:{
        type:String, 
        maxLength: 50,
        required: false
    },
    address1:{
        type:String,
        maxLength: 100,
        required:false
    },
    address2:{
        type:String,
        maxLength: 100,
        required:false
    },
    city:{
        type:String,
        maxLength: 100,
        required:false
    },
    states:{
        type:String,
        required:false
    },
    zip:{
        type:String,
        minLength: 5,
        maxLength: 9,
        required:false
    },
    QuoteHist: {
        type:[] 
    }
})

const coll = new mongoose.model("logindatabases",schema)

module.exports=coll