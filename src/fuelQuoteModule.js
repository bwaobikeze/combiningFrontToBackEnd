const { Console } = require("console");
const quotes = require("./quotes");
const profs = require("./profiles");
class fuelQuoteModule {
  /*
  Explanation for function UCLocationOC():
  takes in the user selected state selected, gallons requested, the delvery date, and address
  and creates a quote object
   */
  UCLocationOC(CityDropDown, GallonsRequested, deliverDate, adresPassed) {
    var tempQ = new quotes();
    tempQ.SetGallon(GallonsRequested);
    tempQ.setcitySelected(CityDropDown);
    tempQ.getCurrentDate();
    tempQ.setPrice(1.5);
    tempQ.setDelivaryDate(deliverDate);
    tempQ.SetAdress(adresPassed);
    return tempQ;
  }
  
  //what profit margin we want calculate the quote for the user
  UCPricingTotal(userQuote, UserID) {
    const LocationFactTexas = 0.02;
    const LocationFactOutOfState = 0.04;
    let ProfitMargin;
    const check = profs.findOne({ userId: UserID });

    //calculates the total based on the criteria given to us
    if (userQuote.citySelected == "TX") {
      if (check) {
        ProfitMargin = userQuote.getPrice() * (LocationFactTexas - 0.01);
        if (userQuote.gallon.valueOf() > 1000) {
          ProfitMargin =
            userQuote.getPrice() * (LocationFactTexas - 0.01 + 0.02 + 0.1);
        } else {
          ProfitMargin =
            userQuote.getPrice() * (LocationFactTexas - 0.01 + 0.03 + 0.1);
        }
      } else {
        if (userQuote.gallon.valueOf() > 1000) {
          ProfitMargin =
            userQuote.getPrice() * (LocationFactTexas + 0.02 + 0.1);
        } else {
          ProfitMargin =
            userQuote.getPrice() * (LocationFactTexas + 0.03 + 0.1);
        }
      }
    } else {
      if (check) {
        ProfitMargin = userQuote.getPrice() * (LocationFactOutOfState - 0.01);
        if (userQuote.gallon.valueOf() > 1000) {
          ProfitMargin =
            userQuote.getPrice() * (LocationFactOutOfState - 0.01 + 0.02 + 0.1);
        } else {
          ProfitMargin =
            userQuote.getPrice() * (LocationFactOutOfState - 0.01 + 0.03 + 0.1);
        }
      } else {
        if (userQuote.gallon.valueOf() > 1000) {
          ProfitMargin =
            userQuote.getPrice() * (LocationFactOutOfState + 0.02 + 0.1);
        } else {
          ProfitMargin =
            userQuote.getPrice() * (LocationFactOutOfState + 0.03 + 0.1);
        }
      }
    }

    userQuote.SetSugggestedPrice(ProfitMargin);
    userQuote.totalQuote =
      userQuote.gallon.valueOf() * userQuote.GetSugggestedPrice();

    return userQuote.totalQuote;
  }
}
module.exports = fuelQuoteModule;
