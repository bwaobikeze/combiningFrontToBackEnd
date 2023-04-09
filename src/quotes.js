//Quotes object " we may need it for making the Quote history"

class quotes {
  gallon;
  date;
  price;
  UsersDelveryAddress;
  DelivaryDate;
  sugestedPrice;
  totalQuote;
  StateSelected;
  citySelected;
  setStateSelected(statePicked) {
    this.StateSelected = statePicked;
  }
  GetStateSelected() {
    return this.StateSelected;
  }
  setcitySelected(cityPicked) {
    this.citySelected = cityPicked;
  }
  GetcitySelected() {
    return this.citySelected;
  }
  SetAdress(UserAddress) {
    this.UsersDelveryAddress = UserAddress;
  }
  getCurrentDate() {
    this.date = new Date();
  }
  GetAdress() {
    return this.UsersDelveryAddress;
  }
  setDelivaryDate(deliveryday) {
    this.DelivaryDate = deliveryday;
  }
  GetDelivaryDay() {
    return this.DelivaryDate;
  }
  setPrice(numberForPrice) {
    this.price = numberForPrice;
  }
  getPrice() {
    return this.price;
  }
  SetSugggestedPrice(margin) {
    this.sugestedPrice = this.price + margin;
  }
  GetSugggestedPrice() {
    return this.sugestedPrice;
  }
  SetGallon(Gallon) {
    this.gallon = Gallon;
  }
}
module.exports = quotes;
