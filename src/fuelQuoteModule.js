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

  //add a quote to the users account(enter object and store in a Linked List the new quote)
  /*
  Explanation for function UCClienQuoteManagement():
  takes in the user email the newly created Quote object and the user list(this can change when we get the database up and running)
  and searches through the user database list and then once we find the user email that we also 
  passed in we retrieve that users quote history list and push/add the latest quote object into the users UserHistory list  breaks out of the loop 
   */
  // UCClienQuoteManagement(UCQuote, userID, UserDBLIst) {
  //   var UserDBLIst;
  //   for (let i = 0; i < UserDBLIst.length; i++) {
  //     if (userID == UserDBLIst[i].id) {
  //       ListOfUsers[i].UserHistory.push(UCQuote);
  //       break;
  //     }
  //   }
  // }

  //displays quotes in a tabular display(this should return data in a format that the front end team can display anyway they like.
  /*
  Explanation for function UCClientHistory():
  takes in the user email and the user list(this can change when we get the database up and running)
  and searches through the user database list and then once we find the user email that we also 
  passed in we retrieve that users quote history list breaks out of the loop then we iterate over
  the users quote history and print them to the console(This can be a good way to get each property of the quote class and display 
  each of them with each quote) 
   */
  /**
   *
   * @param {*} userEmail
   * @param {*} UserDBLIst
   */
  // UCClientHistory(userEmail, UserDBLIst) {
  //   var UserDBLIst = [];
  //   var returnedUser;
  //   for (let i = 0; i < ListOfUsers.length; i++) {
  //     if (userEmail == UserDBLIst[i].email) {
  //       returnedUser = UserDBLIst[i];
  //       break;
  //     }
  //   }
  //   returnedUser.UserHistory.forEach((element) => {
  //     Console.log(element);
  //   });
  // }

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
