/*
 * Input: summonerId, Output: Summoner Object

 * The purpoes of this function is to take in a summoner ID, and use the Riot Games API to turn that into ID into a 'Summoner Object'. A summoner object contains relevant information such as
 * number of wins, rank, number of wins with a certain champion etc. The first call to the API is done to receive the summoner name, icon and encrypted id. We use the encrypted id in a second 
 * call to the API to receive further information such as rank. This helper function is called in the GET(/Summoner) route.
 * 
 */
var request = require('request');

module.exports = {
    createSummoner: function (summonerName, callback) {
        var summonerName = summonerName;
        const apiKey = "?api_key=RGAPI-15c087e7-8d9b-49f4-9867-8f4788d3cf0a"; //I have to regenerate this key from the Riot Games API Dashboard every 24 hours.
        request("https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + summonerName + apiKey, function (error, response, body) {
            if (error) {
                console.log("Error with the API  summoner by name request");
                console.log(error);
            } else {
                if (response.statusCode = 200) {// Response 200 indicates Successful api call
                    var parsedData = JSON.parse(body);//puts the data in a usable format
                    var name = parsedData.name;
                    var icon = parsedData.profileIconId;
                    var level = parsedData.summonerLevel;
                    var summonerId = parsedData.id;//This is an encrypted Id. We can use to gain more information on this summoner which we will do below.
                }
                request("https://na1.api.riotgames.com/lol/league/v4/positions/by-summoner/" + summonerId + apiKey, function (error, response, body) {
                    if (error) {
                        console.log("Error with the API position by summoner request");
                        console.log(error);
                    } else {
                        if (response.statusCode = 200) {// Response 200 indicates Successful api call
                            var parsedData = JSON.parse(body);//puts it into a format we can use
                            var rank = {
                                //NOTE: parsedData contains two arrays of information. Information at index 0 contains the statistics for ranked flex. We want solo/duo queue information which resides at
                                //at index 1 of the array. 
                                tier: parsedData[1].tier, //Example: Silver
                                division: parsedData[1].rank, //Example: 3
                                lp: parsedData[1].leaguePoints//Example: 27
                            };
                            var wins = parsedData[1].wins;
                            var losses = parsedData[1].losses;
                        }
                        //For simplicity - we store all information gathered into a summoner object and return it.
                        var summonerObject = {
                            name: name,
                            icon: icon,
                            level: level,
                            summonerId: summonerId,
                            rank: rank,
                            wins: wins,
                            losses: losses
                        };
                        //console.log(summonerObject);
                        callback(summonerObject);
                    }
                });
            }
        });
    }
}