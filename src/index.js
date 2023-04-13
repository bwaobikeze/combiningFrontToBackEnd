const express=require("express")
const app=express()
const path=require("path")
const coll=require("./database")
//const profs=require("./profiles")
const bcrypt = require('bcrypt')
const session = require('express-session');
const fuelQuoteModule = require("./fuelQuoteModule");

app.use(express.json())
app.set("view engine","ejs")

app.use(express.urlencoded({ extended: false }))
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true,
}))

app.get("/",(req,res)=>{
    res.render("login")
})

app.get("/index", (req, res) => {
    res.redirect("/login");
    //console.log(req.session.userID);
})

app.get("/register",(req,res)=>{
    res.render("register")
})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.get("/profmgmt/:id",(req,res)=>{
    res.render("profmgmt", { userId: req.params.id })
})

app.get("/quoteform/:id",async(req,res)=>{
    //console.log(req.params.id)
    const user = coll.findById(req.params.id)
    if (!user) {
        return res.status(404).send('User not found');
        res.render("quoteform")
    } else {
        console.log("User Found");
        const User = await coll.findOne({ _id: req.params.id });
        //console.log(User);
        res.render("quoteform", { add1: User.address1 ,userId: req.params.id});
    }
    //console.log(user.username);
})

app.get("/quotehist/:id",async (req, res) => {
    const check = await coll.findById(req.params.id)
    res.render("quotehist",{ userId: req.params.id,QuoteHist:check.QuoteHist})
    console.log(req.params.id);
})

app.post("/register",async (req,res)=>{
    const encryptedpass = await bcrypt.hash(req.body.password, 10)
    info={
        username: req.body.username,
        password: encryptedpass
    }
    password = await req.body.password
    confirmpassword = await req.body.confirmpassword

    if(password!=confirmpassword){
        res.send("passwords not matching")
    } else{
        await coll.insertMany([info]) 
        res.render("login")
    }
    console.log(info)
})

app.post("/login",async (req,res)=>{
    try{
        const check = await coll.findOne({username:req.body.username})
        if (await bcrypt.compare(req.body.password, check.password)) {
            req.session.userID = check._id;
            res.render("index",{ userId: req.session.userID,user:check})
        }
        else{
            res.send("wrong password")
        }
    } catch {
        res.send("wrong details")
    }
})
app.post("/quoteform/:id", async (req, res) => {
    foundUser = await coll.findById(req.params.id);
    //console.log(foundUser);
    let gallonVal = req.body.gallons;
    let getDate = new Date(req.body.date);
    let cityChossin = req.body.state;
     let userAdress = foundUser.address1;
 let newActioin = new fuelQuoteModule();
    let testQuote = newActioin.UCLocationOC(cityChossin, gallonVal, getDate, userAdress)
    //console.log(testQuote);
    newActioin.UCPricingTotal(testQuote, foundUser.QuoteHist);
    console.log(testQuote);
    const filter = { _id: req.params.id };
    const update = { $push: { QuoteHist: testQuote } };
    const options = { new: true };
    foundUser=await coll.findOneAndUpdate(filter, update, options);
     res.render("quoteform", { "add1": testQuote.UsersDelveryAddress, "totaldue": testQuote.totalQuote, "suggestprice": testQuote.sugestedPrice ,userId: req.params.id});

})

app.post("/profmgmt/:id", async (req, res) => {
  const {
        fullname,
        address1,
        address2,
        city,
        states,
        zip
    } = req.body;
    const filter = { _id: req.params.id }
    const update = { fullname, address1, address2, city, states, zip }
    const options = { new: true };
    const updatedUser = await coll.findOneAndUpdate(filter, update, options);
    console.log(filter);
    const check = await coll.findOne({_id:req.params.id})
    res.render("index",{ userId: req.params.id, user:check })
})
app.listen(3000)