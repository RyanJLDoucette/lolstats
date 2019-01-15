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
    /*
    summonerHelper.getParticipatingSummoners("JEjgT3sTNI7079Gl4VbGM4mD-BOdvJx5VnvONKMU5Cz-jxU", function(matchInfo) {
        if(matchInfo) {//if it was defined
            //if it was defined
            res.render("match", {matchInfo: matchInfo});
        } else {
            //I should probably send them back to the summoner page with red texts somewhere stating that the summoner was not in game
            res.render("/")
            console.log("ERROR: received participants not defined");
        }
    });
    */

    
    summonerHelper.getParticipatingSummoners(req.params.id, function(matchInfo) {
        if(matchInfo) {//if it was defined
            //if it was defined
            res.render("match", {matchInfo: matchInfo});
        } else {
            //I should probably send them back to the summoner page with red texts somewhere stating that the summoner was not in game
            res.render("/")
            console.log("ERROR: received participants not defined");
        }
    });
    
 });

module.exports = router