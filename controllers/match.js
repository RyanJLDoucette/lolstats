// DEPENDENCIES
var express             = require("express"),
    bodyParser          = require("body-parser"),
    app                 = express(),
    router              = express.Router();
    
// APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
var summonerHelper = require('../helpers/SummonerHelper.js');

router.get("/match/:id", function(req, res){
    summonerHelper.getParticipatingSummoners(req.params.id);

    /*
    summonerHelper.getParticipatingSummoners(req.params.id, function(participatingSummoners) {
        if(participatingSummoners) {
           res.send("There were summoners -> Go to the match page");
        } else {
           res.send("Summoner was not in game -> remain on current page");
        }
        
        
     });*/
    res.render("match");
 });

module.exports = router