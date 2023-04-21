const express = require("express");
const app = express();
const path = require("path");
const coll = require("./database");
const profs = require("./profiles");
const fuelquote = require("./fuelquote");
const bcrypt = require("bcrypt");
const session = require("express-session");
const fuelQuoteModule = require("./fuelQuoteModule");

app.use(express.json());
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/index", (req, res) => {
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/profmgmt", (req, res) => {
  res.render("profmgmt");
});

app.get("/quoteform", async (req, res) => {
  const user = profs.findOne({ userId: req.session.userID });
  if (!user) {
    return res.status(404).send("User not found");
    res.render("quoteform");
  } else {
    console.log("User Found");
    console.log("In /quoteform Get request");
    const User = await profs.findOne({ userId: req.session.userID });
    res.render("quoteform", { add1: User.address1 });
  }
});

app.get("/quotehist", async (req, res) => {
  const check = await fuelquote.QuoteModel.find({ userId: req.session.userID });
  //console.log(check);
  res.render("quotehist", { QuoteHist: check });
  console.log(req.session.userID);
});

app.post("/index", async (req, res) => {
  const check = await coll.findById(req.session.userID);
  res.render("index", { user: check });
});

app.post("/register", async (req, res) => {
  const encryptedpass = await bcrypt.hash(req.body.password, 10);
  info = {
    username: req.body.username,
    password: encryptedpass,
  };
  password = await req.body.password;
  confirmpassword = await req.body.confirmpassword;

  if (password != confirmpassword) {
    res.send("passwords not matching");
  } else {
    await coll.insertMany([info]);
    res.render("login");
  }
  console.log(info);
});

app.post("/login", async (req, res) => {
  try {
    const check = await coll.findOne({ username: req.body.username });
    if (await bcrypt.compare(req.body.password, check.password)) {
      req.session.userID = check._id;
      const checkProf = await profs.findOne({ userId: req.session.userID });
      if (checkProf) {
        res.render("index", { user: true });
      } else {
        res.render("index", { user: false });
      }
    } else {
      req.session.message = "Incorrect password";
      res.render("login", { message: req.session.message });
    }
  } catch {
    req.session.message = "Wrong Details (May want to register first)";
    res.render("login", { message: req.session.message });
  }
});
app.post("/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login");
    }
  });
});
app.post("/Partialquoteform", async (req, res) => {
  foundUser = await profs.findOne({ userId: req.session.userID });
  let gallonVal = req.body.gallons;
  let getDate = new Date(req.body.date);
  let cityChossin = req.body.state;
  let userAdress = foundUser.address1;
  let newActioin = new fuelQuoteModule();
  let testQuote = newActioin.UCLocationOC(
    cityChossin,
    gallonVal,
    getDate,
    userAdress
  );
  newActioin.UCPricingTotal(testQuote, foundUser.QuoteHist);
  res.render("quoteform", {
    gallons: testQuote.gallon,
    state: req.body.state,
    add1: testQuote.UsersDelveryAddress,
    date: req.body.date,
    totaldue: testQuote.totalQuote,
    suggestprice: testQuote.sugestedPrice,
  });
});
app.post("/quoteform", async (req, res) => {
  foundUser = await profs.findOne({ userId: req.session.userID });
  let gallonVal = req.body.gallons;
  let getDate = new Date(req.body.date);
  let cityChossin = req.body.state;
  let userAdress = foundUser.address1;
  let newActioin = new fuelQuoteModule();

  let testQuote = newActioin.UCLocationOC(
    cityChossin,
    gallonVal,
    getDate,
    userAdress
  );
  newActioin.UCPricingTotal(testQuote, req.session.userID);
  let newQuote = {
    userId: req.session.userID,
    gallonreq: gallonVal,
    deliveryaddress: userAdress,
    deliverydate: getDate,
    suggestedpricepergallon: testQuote.sugestedPrice,
    totalamountdue: testQuote.totalQuote,
  };
  await fuelquote.createQuote(newQuote);
  res.render("quoteform", { add1: foundUser.address1 });
});

app.post("/profmgmt", async (req, res) => {
  const { fullname, address1, address2, city, states, zip } = req.body;

  const check = await profs.findOne({ userId: req.session.userID });
  if (check) {
    const filter = { userId: req.session.userID };
    const update = { fullname, address1, address2, city, states, zip };
    const options = { new: true };
    const updatedUser = await profs.findOneAndUpdate(filter, update, options);
    console.log("Updated Profile in (profmgmt Post Request");
    res.render("index", { user: true });
  } else {
    let newProfile = {
      userId: req.session.userID,
      fullname: fullname,
      address1: address1,
      address2: address2,
      city: city,
      states: states,
      zip: zip,
    };
    await profs.insertMany(newProfile);
    let findProfile = profs.findOne({ userId: req.session.userID });
    res.render("index", { user: true, findProfile });
  }
});
app.listen(3000);
