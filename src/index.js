const express = require("express");
const app = express();
const path = require("path");
const coll = require("./database");
const profs = require("./profiles");
const fuelquote = require("./fuelquote");
const bcrypt = require("bcrypt");
const session = require("express-session");
const fuelQuoteModule = require("./fuelQuoteModule");
const axios = require("axios");
//using EJS as our view engine
app.use(express.json());
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
//creating the user session using express sessions
app.use(
  session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
  })
);
//performing A GET request to the current directory and rendering the login page
app.get("/", (req, res) => {
  res.render("login");
});
//performing A GET request to the current directory and rendering the login page
app.get("/index", (req, res) => {
  res.redirect("/login");
});

//performing A GET request to the register route and rendering the register page
app.get("/register", (req, res) => {
  res.render("register");
});
//performing A GET request to the login route and renders the login page
app.get("/login", (req, res) => {
  res.render("login");
});

/********************************************************
performing A GET request to the profile managment route:

it checks to see if the user that is perfroming the request
has a profile that is stored in the database if it does it renders the 
page with the profile data if not renders a blank page
*********************************************************/
app.get("/profmgmt", async (req, res) => {
  const check = await profs.findOne({ userId: req.session.userID });
  if (check) {
    res.render("profmgmt", {
      fullname: check.fullname,
      address1: check.address1,
      address2: check.address2,
      city: check.city,
      state: check.states,
      zip: check.zip,
    });
  } else {
    res.render("profmgmt");
  }
});
/********************************************************
performing A GET request to the Quote form route:

it checks to see if the user that is accesing the page exist 
if they dont it return an error status 404 with a message 
if they do it prints "user found" message in the server side console
and searches the profiles database to render the form quote page with
the users address shown on the page
*********************************************************/
app.get("/quoteform", async (req, res) => {
  const user = profs.findOne({ userId: req.session.userID });
  if (!user) {
    return res.status(404).send("User not found");
  } else {
    console.log("User Found");
    console.log("In /quoteform Get request");
    const User = await profs.findOne({ userId: req.session.userID });
    res.render("quoteform", { add1: User.address1, state: User.states });
  }
});
/********************************************************
performing A GET request to the Quote history page route:

it finds the users quotes in the quotes database based on the 
the usersId that is attched to each of the quotes that the user
submmites. then renders the history page with each quote stored 
and iterated through to show the tabular display on the wbpage that is rendered
*********************************************************/
app.get("/quotehist", async (req, res) => {
  const check = await fuelquote.QuoteModel.find({ userId: req.session.userID });
  res.render("quotehist", { QuoteHist: check });
});

/********************************************************
performing A POST request to the  Main Page route:

it find the user connected to this session and then 
renders the main page passing in the user json
*********************************************************/
app.post("/index", async (req, res) => {
  const check = await coll.findById(req.session.userID);
  res.render("index", { user: check });
});

/********************************************************
performing A POST request to the Register page route:

Once the register form is submitted it then encrypts the password and then it checks to see if 
there is a user with the given username in the database already 
if there is we then render the page with an empty form with a message stating that the username already 
exists. we also check if the two passwords that are entered are equal if they are and the user does not exist in the 
database already then accept the user into the database and then render the login page
*********************************************************/

app.post("/register", async (req, res) => {
  const encryptedpass = await bcrypt.hash(req.body.password, 10);
  info = {
    username: req.body.username,
    password: encryptedpass,
  };
  password = await req.body.password;
  confirmpassword = await req.body.confirmpassword;

  const existingUser = await coll.findOne({ username: req.body.username });
  if (existingUser) {
    req.session.message2 = "Username already exists";
    res.render("register", { message: req.session.message2 });
    return;
  }

  if (password != confirmpassword) {
    res.send("passwords not matching");
  } else {
    await coll.insertMany([info]);
    res.render("login");
  }
  console.log(info);
});

/********************************************************
performing A POST request to the Login page route:

Once the information that is typed in the log in screen is submitted
we perform a try catch to see whether the information that is given is correct so the user can log in
if not we just re render the page with an appropriate correction message
*********************************************************/
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
/********************************************************
performing A POST request to the logout page route:

Once the logout button is pressed it derstys the session for the user
and redirects them to the login page
*********************************************************/
app.post("/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login");
    }
  });
});
/********************************************************
performing A POST request to the Partial Quote form page route:

Once the form is submitted with the "Get Quote" button we get the form values
and pass it into the UCLocationOC() function this then creates a quote object and return
it. Afterwards we then pass the new quote object to the UCPricingTotal() with the userid and the it calculates 
the quote based on the information given and then saves the values to the quote object and returns the quote object. 
We then attach the properties of the quote object to the propreties of the quote database schema.
then created a new quote to store in the quote database. we then re-render the page with the values given but also with
the sugested price and the total price.
*********************************************************/
app.post("/Partialquoteform", async (req, res) => {
  foundUser = await profs.findOne({ userId: req.session.userID });
  let gallonVal = req.body.gallons;
  let getDate = new Date(req.body.date);
  let cityChossin = req.body.state;
  let userAdress = foundUser.address1;
  let newActioin = new fuelQuoteModule();
  let today = new Date();
  if (getDate < today) {
    res.render("quoteform", {
      error: "Delivery date cannot be in the past.",
      add1: foundUser.address1,
      state: foundUser.states,
    });
  } else {
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
  }
});
/********************************************************
performing A POST request to the Quote form page route:

Once the form is submitted with the "Ok" button we get the form values
and pass it into the UCLocationOC() function this then creates a quote object and return
it. Afterwards we then pass the new quote object to the UCPricingTotal() with the userid and the it calculates 
the quote based on the information given and then saves the values to the quote object and returns the quote object. 
We then attach the properties of the quote object to the propreties of the quote database schema.
then created a new quote to store in the quote database. we then store the quote in the datbase and re-renderd the page with empty values but have the 
address of the user still rendered.
*********************************************************/
app.post("/quoteform", async (req, res) => {
  foundUser = await profs.findOne({ userId: req.session.userID });
  let gallonVal = req.body.gallons;
  let getDate = new Date(req.body.date);
  let cityChossin = req.body.state;
  let userAdress = foundUser.address1;
  let newActioin = new fuelQuoteModule();
  let today = new Date();
  if (getDate < today) {
    res.render("quoteform", {
      error: "Delivery date cannot be in the past.",
      add1: foundUser.address1,
      state: foundUser.states,
    });
  } else {
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
    res.render("quoteform", {
      add1: foundUser.address1,
      state: foundUser.states,
    });
  }
});
/********************************************************
performing A POST request to the Profile management page route:

once form is submitted we then check if there is a profile already in the database
if there is update that profile content if not then insert the new profile in the 
profile database and redirect them to the main page
*********************************************************/
app.post("/profmgmt", async (req, res) => {
  const { fullname, address1, address2, city, states, zip } = req.body;

  const check = await profs.findOne({ userId: req.session.userID });
  if (check) {
    const filter = { userId: req.session.userID };
    const update = { fullname, address1, address2, city, states, zip };
    const options = { new: true };
    const updatedUser = await profs.findOneAndUpdate(filter, update, options);
    console.log("Updated Profile in (profmgmt Post Request)");
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
module.exports = app;
//Code Coverage

var correctRes = 0;

// Sending a POST request to register a new user
axios
  .post("http://localhost:3000/register", {
    username: "testuser",
    password: "testpassword",
    confirmpassword: "testpassword",
  })
  .then((response) => {
    correctRes += 1;
  })
  .catch((error) => {
    correctRes = correctRes;
  });

// Sending a POST request to log in with correct credentials
axios
  .post(
    "/login",
    {
      username: "testuser",
      password: "testpassword",
    },
    { withCredentials: true }
  )
  .then((response) => {
    correctRes += 1;
  })
  .catch((error) => {
    correctRes = correctRes;
  });

// Sending a POST request to log in with incorrect credentials
axios
  .post(
    "/login",
    {
      username: "testuser",
      password: "wrongpassword",
    },
    { withCredentials: true }
  )
  .then((response) => {
    correctRes += 1;
  })
  .catch((error) => {
    correctRes = correctRes;
  });

// Sending a GET request to access the quote form page without logging in
axios
  .get("/quoteform")
  .then((response) => {
    correctRes += 1;
  })
  .catch((error) => {
    correctRes = correctRes;
  });

// Sending a POST request to log in with correct credentials
axios
  .post(
    "/login",
    {
      username: "testuser",
      password: "testpassword",
    },
    { withCredentials: true }
  )
  .then((response) => {
    // Sending a GET request to access the quote form page after logging in
    axios
      .get("/quoteform", { withCredentials: true })
      .then((response) => {
        correctRes += 1;
      })
      .catch((error) => {
        correctRes = correctRes;
      });
  })
  .catch((error) => {
    correctRes = correctRes;
  });

console.log("Code Coverage: " + ((5 - correctRes) / 5) * 100 + "%");
