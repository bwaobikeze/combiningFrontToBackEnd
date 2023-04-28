const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/project");

const schema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  gallonreq: {
    type: String,
    required: true,
  },
  deliveryaddress: {
    type: String,
    maxLength: 100,
    required: true,
  },
  deliverydate: {
    type: String,
    required: true,
  },
  suggestedpricepergallon: {
    type: Number,
    required: false,
  },
  totalamountdue: {
    type: Number,
    required: false,
  },
});

const QuoteModel = new mongoose.model("Quote", schema);

//function to create the quote based on the schemea
const createQuote = async function (values) {
  try {
    console.log(values);
    let quote = await new QuoteModel({
      userId: values.userId,
      gallonreq: values.gallonreq,
      deliveryaddress: values.deliveryaddress,
      deliverydate: values.deliverydate,
      suggestedpricepergallon: values.suggestedpricepergallon,
      totalamountdue: values.totalamountdue,
    })?.save();
    console.log("add new quote");
  } catch (error) {
    console.log("unable to get new quote");
    console.error(error);
  }
};
module.exports = { createQuote, QuoteModel };
