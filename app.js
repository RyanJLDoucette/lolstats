// DEPENDENCIES
var bodyParser          = require("body-parser"),
    http                = require('http'),
    express             = require("express"),
    app                 = express();
    
// APP CONFIG
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(require('./controllers/index.js')); //routes
app.use(require('./controllers/summoner.js'));
app.use(require('./controllers/match.js'));

/*
app.get("/summoner", function(req, res){
   var summonerName = req.query.name; //req.query is what was inputted from the form on the landing page. The input id was name.

   request("https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + summonerName + "?api_key=RGAPI-3a3e56a5-6e2c-4b4b-ad33-d58163ce7c8b", function(error, response, body){
      if(error) {
         console.log("Error with the api request");
      } else {
         if(response.statusCode = 200) {//response 200 means success
            var parsedData = JSON.parse(body);//puts it into a format we can use
            var name = parsedData.name;
            var icon = parsedData.profileIconId;
            var level = parsedData.summonerLevel;
            var summonerId = parsedData.id;
         }
         request("https://na1.api.riotgames.com/lol/league/v4/positions/by-summoner/" + summonerId + "?api_key=RGAPI-3a3e56a5-6e2c-4b4b-ad33-d58163ce7c8b", function(error, response, body){
            if(error) {
               console.log("Error with the api request");
            } else {
               if(response.statusCode = 200) {//response 200 means success
                  var parsedData = JSON.parse(body);//puts it into a format we can use
                  var rank = {
                     tier: parsedData[1].tier,
                     division: parsedData[1].rank,
                     lp: parsedData[1].leaguePoints
                  };
                  var wins = parsedData[1].wins;
                  var losses = parsedData[1].losses;
               }
               var Summoner = {
                  name: name,
                  icon: icon,
                  level: level,
                  summonerId: summonerId,
                  rank: rank,
                  wins: wins,
                  losses: losses
               };
               res.render("summoner", {summoner: Summoner});
            }
         });
      }
   });
});
*/


/*
app.get("*", function(req, res){ // If route not found display the 404 Not Found Page
   res.render("404");
});
*/

//SET PORT 
const port = process.env.PORT || '3000';
app.set('port', port);

//CREATE SERVER
const server = http.createServer(app);

// START SERVER
server.listen(port, () => console.log(`Running on localhost:${port}`));