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
const apiKey = "?api_key=RGAPI-4830227c-cc74-4315-892a-c33fbe48edf4"; //I have to regenerate this key from the Riot Games API Dashboard every 24 hours.

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
                    var accountId = parsedData.accountId;
                    request("https://na1.api.riotgames.com/lol/league/v4/positions/by-summoner/" + summonerId + apiKey, function (error, response, body) {
                        if (error) {
                            console.log("Error with the API position by summoner request");
                            console.log(error);
                        } else {
                            if (response.statusCode == 200 && JSON.parse(body) != "") {// Response 200 indicates Successful api call. 2nd param is needed because if summoner has no ranked stats it will be status code 200 but empty object returned. 
                                var parsedData = JSON.parse(body);//puts it into a format we can use
                                var rankedDataLocation = 0;//If summoner has no ranked flex stats, then data appears at index 0, if they do then it is at index 1
                                if (parsedData[0].queueType == "RANKED_FLEX_SR") {//Sometimes the order of solo queue and flex are reversed. So we just check here to see what index the data we want is at
                                    rankedDataLocation = 1;
                                }
                                var rank = {
                                    tier: parsedData[rankedDataLocation].tier, //Example: Silver
                                    division: parsedData[rankedDataLocation].rank, //Example: 3
                                    lp: parsedData[rankedDataLocation].leaguePoints//Example: 27
                                };
                                var wins = parsedData[rankedDataLocation].wins;
                                var losses = parsedData[rankedDataLocation].losses;
                                //For simplicity - we store all information gathered into a summoner object and return it.
                                var emblem = "../img/emblems/" + rank.tier + "_emblem.png"
                                var summonerObject = {
                                    name: name,
                                    icon: icon,
                                    level: level,
                                    summonerId: summonerId,
                                    accountId: accountId,
                                    rank: rank,
                                    wins: wins,
                                    losses: losses,
                                    winRatio: wins / (wins + losses),
                                    emblem
                                };
                                callback(summonerObject);
                                return
                            }
                            else {// Summoner has no ranked stats
                                callback(false);
                                return
                            }
                        }
                    });//end of second call to the api
                }
                else {//The response code was not 200
                    callback(1);
                    return
                }
            }
        });//end inital call
    },//end create summoner method
    getParticipatingSummoners: function (summonerId, callback) {
        request("https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/" + summonerId + apiKey, function (error, response, body) {
            if (error) {
                console.log("Error getting participating summoners");
                console.log(error);
            } else {
                console.log("https://na1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/" + summonerId + apiKey);
                console.log(response.statusCode);
                if (response.statusCode == 200) {
                    //Summoner is in game
                    var parsedData = JSON.parse(body);//puts the data in a usable format
                    console.log(parsedData);
                    callback(parsedData);
                    return
                }
                else if (response.statusCode == 404) {
                    //Summoner not in game
                    console.log("The request for participating summoners was NOT successful - Summoner is NOT in Game");
                    callback();
                    return
                } else {
                    console.log("The request for participating summoners was NOT successful - Unknown reason");
                }
            }
        });
    },
    getTopChampions: function (accountId) {
        request("https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/" + accountId + apiKey + "&queue=420&season=11", function (error, response, body) {
            if (error) {
                console.log("There was an error obtaining matchlist");
                console.log(error);
            } else {
                if (response.statusCode == 200) {
                    //console.log("https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/" + accountId + apiKey + "&queue=420&season=11");
                    var parsedData = JSON.parse(body);//puts the data in a usable format
                    var ChampionCounter = {};
                    var champion = "";
                    parsedData.matches.forEach(function (match) {
                        champion = match.champion;
                        if (ChampionCounter[champion]) {
                            ChampionCounter[champion]++;
                        } else {
                            ChampionCounter[champion] = 1;
                        }
                    });
                    var firstLargestIndex = Object.keys(ChampionCounter)[0];
                    var secondLargestIndex = Object.keys(ChampionCounter)[0];
                    var thirdLargestIndex = Object.keys(ChampionCounter)[0];//Set all the indexes to the first key. They will be overidden with the right values later.

                    Object.keys(ChampionCounter).forEach(function (key) {
                        //key = the current index, we will use it to remember where the indices of tshe 1st, 2nd and 3rd largest numbers are
                        var currentNumber = ChampionCounter[key];
                        if (currentNumber > ChampionCounter[thirdLargestIndex]) {
                            if (currentNumber > ChampionCounter[secondLargestIndex]) {
                                if (currentNumber > ChampionCounter[firstLargestIndex]) {
                                    //CASE: CurrentNumber is the largest number
                                    thirdLargestIndex = secondLargestIndex;
                                    secondLargestIndex = firstLargestIndex;
                                    firstLargestIndex = key;
                                } else {
                                    //CASE: CurrentNumber is the second largest number
                                    thirdLargestIndex = secondLargestIndex;
                                    secondLargestIndex = key;
                                }

                            } else {
                                //CASE: CurrentNumber is the third largest number
                                thirdLargestIndex = key;
                            }
                        }
                        //CurrentNumber is not greater than the thirdLargestIndex so do nothing
                    });
                } else {
                    console.log("Response was not succcesful: " + response.statusCode);
                }
                request("https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/" + accountId + apiKey + "&champion=" + firstLargestIndex + "&queue=420&season=11", function(err, res, singleChampionBody){
                    if(err) {
                        console.log("error locating all matches of rank queue, season x on champion y");
                        console.log(err);
                    } else {
                        //console.log("https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/" + accountId + apiKey + "&champion" + firstLargestIndex + "&queue=420&season=11");
                        if(res.statusCode == 200) {
                            //success
                            var parsedSingleChampionData = JSON.parse(singleChampionBody);//puts the data in a usable format
                            var gameIdList = [];
                            parsedSingleChampionData.matches.forEach(function(match) {
                                gameIdList.push(match.gameId);
                            });
                            //console.log(gameIdList.slice(5));
                            module.exports.getChampionData(gameIdList.slice(0,5), firstLargestIndex);
                        }
                        else {
                            console.log("ERROR: Response was not succcesful! Response Code: " + res.statusCode);
                        }
                    }
                });
            }
        });
    },//end function
    getChampionData: function(gameIdList, champion) {
        var kills = 0;
        var deaths = 0;
        var assists = 0;
        var wins = 0;
        var losses = 0;
        var count = 0;
        gameIdList.forEach(function(gameId){
            request("https://na1.api.riotgames.com/lol/match/v4/matches/" + gameId + apiKey, function(error, response, body){
                if(error){
                    console.log(error);
                } else {
                    if(response.statusCode == 200) {
                        var parsedData = JSON.parse(body);

                        //Get a reference to the participant
                        var participantId = -1;
                        parsedData.participants.forEach(function(participant){
                            if(participant.championId == champion) {
                                participantId = participant.participantId;
                            }
                        });
                        
                        //add up the participants running total of kills, deaths, assists, wins, losses
                        kills += parsedData.participants[participantId].stats.kills;
                        deaths += parsedData.participants[participantId].stats.deaths;
                        assists += parsedData.participants[participantId].stats.assists;
                        if(parsedData.participants[participantId].win) {
                            wins++;
                        } else {
                            losses++;
                        }

                    } else {
                        console.log("ERROR: Response was not succcesful! Response Code: " + response.statusCode);
                    }
                }
                //divide kils deaths and assits by games played to receive averageo of each
                //Send over an object of the average kills, average assists, average deaths, total wins, total losses
                
            });
        });
        console.log("Kills: " + kills);
        console.log("deaths: " + deaths);
        console.log("assists: " + assists);
        console.log("wins: " + wins);
        console.log("losses: " + losses);
    }//end function
}//end module.exports