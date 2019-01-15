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
var summonerHelper = require('../helpers/SummonerHelper.js');


// SUMMONER PAGE - displays information about the summoner searched for in the landing page
router.get("/summoner", function(req, res){
   var summonerName = req.query.name; //req.query is what was inputted from the form on the landing page. The input id was name.
   summonerHelper.createSummoner(summonerName, function(receivedSummoner) {
      if(receivedSummoner) {
         res.render("summoner", {summoner: receivedSummoner});
      } else {
         res.render("invalid_summoner");
      }
      
   });
});

module.exports = router;