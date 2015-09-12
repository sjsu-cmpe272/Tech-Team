/*
    File for Constants declaration
*/
var Constants = {
  APP_NAME: "New App",
  FUNDING_SI_SCALE: 1000,
  FUNDING_END_DATE: new Date("September 8, 2013"),
  PRODUCT_NAME: "Product: Development Version",
  PRODUCT_SHORT_DESCRIPTION: "One sentence description.",
  TWITTER_USERNAME: "nodejs",
  TWITTER_TWEET: "Tweet.",
  days_left: function() {
      return Math.max(Math.ceil((this.FUNDING_END_DATE - new Date()) / (1000*60*60*24)), 0);
  }
};

module.exports = Constants;
