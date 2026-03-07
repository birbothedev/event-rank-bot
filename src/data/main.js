import { combineDataAndWriteToFile } from "./data-cleaning/DataCleaning.js";
import { getRawPlayerDataFromList } from "./data-cleaning/getdata.js";
import { getAllPlayerWeights } from "./ranking-stuff/AllWeightsToFile.js";
import { rankPlayersFromPoints } from "./ranking-stuff/Ranking.js";

export async function rankAllPlayers(players, eventId){
    // TODO end goal: return json file of all ranked players as text file, have the bot send the text file as an attachment in a message
    const playerDetails = await getRawPlayerDataFromList(players);
    const combinedData = await combineDataAndWriteToFile(playerDetails);
    const weightedData = await getAllPlayerWeights(combinedData);

    const rankedPlayers = await rankPlayersFromPoints(weightedData);

    return rankedPlayers;
}