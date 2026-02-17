import { combineDataAndWriteToFile } from "./data-cleaning/DataCleaning.js";
import { getRawPlayerDataFromList } from "./data-cleaning/getdata.js";
import { getAllPlayerWeights } from "./ranking-stuff/AllWeightsToFile.js";
import { rankPlayersFromPoints } from "./ranking-stuff/Ranking.js";

export async function rankAllPlayers(players, eventId){
    // TODO end goal: return json file of all ranked players as text file, have the bot send the text file as an attachment in a message
    const playerDetails = await getRawPlayerDataFromList(players, `raw-data${eventId}`, 'outputs');

    const combinedData = await combineDataAndWriteToFile(playerDetails, `combined-data${eventId}`, 'outputs');
    const weightedData = await getAllPlayerWeights(combinedData, `weighted-data${eventId}`, 'outputs');

    const rankedPlayers = await rankPlayersFromPoints(weightedData, `ranked-data${eventId}`, 'outputs');

    return rankedPlayers;
}

// async function testWithWholeClan(){
//     const playerDetails = await getRawPlayerDataFromList('parsedcsv', `raw-data${5}`, 'outputs');
//     const combinedData = await combineDataAndWriteToFile(playerDetails, `combined-data${5}`, 'outputs');
//     const weightedData = await getAllPlayerWeights(combinedData, `weighted-data${5}`, 'outputs');

//     const rankedPlayers = await rankPlayersFromPoints(weightedData, `ranked-data${eventId}`, 'outputs');

//     return rankedPlayers;
// }