import { getRawPlayerDataFromList } from "./data-cleaning/getdata.js";

export async function rankAllPlayers(players, exportFileName, TEMP_DIR){
    // TODO end goal: return json file of all ranked players as text file, have the bot send the text file as an attachment in a message
    const playerDetails = await getRawPlayerDataFromList(players, exportFileName, TEMP_DIR);
    return playerDetails;
}