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

app.get("*", function(req, res){ // If route not found display the 404 Not Found Page
   res.render("404");
});

//SET PORT 
const port = process.env.PORT || '3000';
app.set('port', port);

//CREATE SERVER
const server = http.createServer(app);

// START SERVER
server.listen(port, () => console.log(`Running on localhost:${port}`));