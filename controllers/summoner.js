// DEPENDENCIES
var   bodyParser     = require("body-parser"),
      express        = require("express"),
      request        = require('request'),
      router         = express.Router(),
      app            = express();

// APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
var getSummoner = require('../helpers/createSummoner.js');


// SUMMONER PAGE - displays information about the summoner searched for in the landing page
router.get("/summoner", function(req, res){
   var summonerName = req.query.name; //req.query is what was inputted from the form on the landing page. The input id was name.
   //var summoner = getSummoner.createSummoner(summonerName);//This is a call to a helper function that takes the summoner name and uses the riot games API to populate a "Summoner Object" which contains the relevant data of the summoner to be displayed to the user.
   getSummoner.createSummoner(summonerName, function(receivedSummoner) {
      res.render("summoner", {summoner: receivedSummoner});
   });
});

module.exports = router;