// DEPENDENCIES
var express             = require("express"),
    bodyParser          = require("body-parser"),
    app                 = express(),
    router              = express.Router();
    

// APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

router.get("/match", function(req, res){
    res.render("match");
 });

module.exports = router