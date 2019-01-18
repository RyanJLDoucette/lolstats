/*
 * Input: summonerId, Output: Summoner Object

 * The purpoes of this function is to take in a summoner ID, and use the Riot Games API to turn that into ID into a 'Summoner Object': a summoner object containing relevant information such as
 * number of wins, rank, number of wins with a certain champion etc. The first call to the API is done to receive the summoner name, icon and encrypted id. We use the encrypted id in a second 
 * call to the API to receive further information such as rank. This helper function is called in the GET(/Summoner) route.
 * 
 * ISSUE: YOU GET AN ERROR SEARCHING FOR SUMMONERS WHO DO NOT HAVE RANKED FLEX STATS. THIS IS BECAUSE SOLO STATS ARE STORED AT PARSEDATA[0] WHEN FLEX STATS DO NOT EXIST.
 * YOUR CODE ASSUMES SOLO STATS ARE ALWAYS LOCATED AT PARSEDATA[1] SO YOU ARE GETTING UNDEFINED DURING THOSE CASES.
 * 
 */
var request = require('request');
const apiKey = "?api_key=RGAPI-5b41e60c-a014-4245-b3ba-f5ba94306912"; //I have to regenerate this key from the Riot Games API Dashboard every 24 hours.

module.exports = {
    createSummoner: function (summonerName, callback) {
        var summonerName = summonerName;
        request("https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + summonerName + apiKey, function (error, response, body) {
            if (error) {
                console.log("Error with the API  summoner by name request");
                console.log(error);
            } else {//The call to the API was valid format, but we still need to check the response code for success
                if (response.statusCode == 200) {// Response 200 indicates Successful api calls
                    // DEBUG console.log("https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + summonerName + apiKey);
                    var parsedData = JSON.parse(body);//puts the data in a usable format
                    var name = parsedData.name;
                    var icon = parsedData.profileIconId;
                    var level = parsedData.summonerLevel;
                    var summonerId = parsedData.id;//This is an encrypted Id. We can use to gain more information on this summoner which we will do below.
                    request("https://na1.api.riotgames.com/lol/league/v4/positions/by-summoner/" + summonerId + apiKey, function (error, response, body) {
                        if (error) {
                            console.log("Error with the API position by summoner request");
                            console.log(error);
                        } else {
                            if (response.statusCode == 200 && JSON.parse(body) != "") {// Response 200 indicates Successful api call. 2nd param is needed because if summoner has no ranked stats it will be status code 200 but empty object returned. 
                                var parsedData = JSON.parse(body);//puts it into a format we can use
                                var rankedDataLocation = 0;//If summoner has no ranked flex stats, then data appears at index 0, if they do then it is at index 1
                                //console.log("https://na1.api.riotgames.com/lol/league/v4/positions/by-summoner/" + summonerId + apiKey);
                                if(parsedData[1]) {//if parsedData[1] exists, then summoner has ranked flex stats at index 0. We're looking solo queue data which we know now is at index 1
                                    rankedDataLocation = 1;
                                }
                                var rank = {
                                    //NOTE: parsedData contains two arrays of information. Information at index 0 contains the statistics for ranked flex. We want solo/duo queue information which resides at
                                    //at index 1 of the array. 
                                    tier: parsedData[rankedDataLocation].tier, //Example: Silver
                                    division: parsedData[rankedDataLocation].rank, //Example: 3
                                    lp: parsedData[rankedDataLocation].leaguePoints//Example: 27
                                };
                                var wins = parsedData[rankedDataLocation].wins;
                                var losses = parsedData[rankedDataLocation].losses;
                                //For simplicity - we store all information gathered into a summoner object and return it.
                                var summonerObject = {
                                    name: name,
                                    icon: icon,
                                    level: level,
                                    summonerId: summonerId,
                                    rank: rank,
                                    wins: wins,
                                    losses: losses,
                                    winRatio: wins / (wins + losses)

                                };
                                callback(summonerObject);
                            }
                            else {// Summoner has no ranked stats
                                callback(false);
                            }
                        }
                    });//end of second call to the api
                }
                else {//The response code was not 200
                    callback(1);
                }
            }
        });//end inital call
    },//end create summoner method
    getParticipatingSummoners: function(summonerId, callback) {
        request("https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/" + summonerId + apiKey, function(error, response, body) {
            if(error) {
                console.log("Error getting participating summoners");
                console.log(error);
            } else {
                console.log("https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/" + summonerId + apiKey);
                console.log(response.statusCode);
                if(response.statusCode == 200) {
                    //Summoner is in game
                    var parsedData = JSON.parse(body);//puts the data in a usable format
                    callback(parsedData);
                    return
                }
                else if(response.statusCode == 404 ){
                    //Summoner not in game
                    console.log("The request for participating summoners was NOT successful - Summoner is NOT in Game");
                    callback();
                    return
                } else {
                    console.log("The request for participating summoners was NOT successful - Unknown reason");
                }
            }
        });
    }
}//end module.exports