import { writeToFile } from "../data-cleaning/output.js";

// multipliers
const bossMultiplier = 2;
const skillMultiplier = 1.5;
const efficiencyMultiplier = 1;

// total categories
const totalCategories = 3;

// rank tiers
const rank1 = 0;
const rank2 = 10;
const rank3 = 20;
const rank4 = 30;
const rank5 = 40;
const rank6 = 50;

//rank order
const rankOrder = {
    'No Rank': 0,
    'Rank 1': 1,
    'Rank 2': 2,
    'Rank 3': 3,
    'Rank 4': 4,
    'Rank 5': 5,
    'Rank 6': 6
};

async function calculateTotalPointValueFromWeights(weightedPlayerData){
    const results = [];

    for (const player of weightedPlayerData) {
        const bossWeights = player.data.bossWeights;
        const skillWeights = player.data.skills;
        const efficiencyWeights = player.data.efficiency;

        // get the sum of each points type
        const totalBossPoints = Object.values(bossWeights).reduce((sum, current) => sum + current, 0);
        const totalSkillPoints = Object.values(skillWeights).reduce((sum, current) => sum + current, 0);
        const totalEfficiencyPoints = Object.values(efficiencyWeights).reduce((sum, current) => sum + current, 0);

        const totalPoints = (totalBossPoints * bossMultiplier) + (totalSkillPoints * skillMultiplier) + (totalEfficiencyPoints * efficiencyMultiplier);

        const totalAveragedPoints = totalPoints / totalCategories;

        const decimalPlaces = 3;
        const factor = 10 ** decimalPlaces;
        const roundedPoints = Math.round(totalAveragedPoints * factor) / factor;

        results.push({
            playerName: player.playerName,
            totalPoints: roundedPoints
        });
    }
    console.log(results);
    return results;
}   

export async function rankPlayersFromPoints(playerData, exportfilename, TEMP_DIR){
    const playerPoints = await calculateTotalPointValueFromWeights(playerData);
    const ranks = {};

    for (const playerData of playerPoints) {
        const { playerName, totalPoints } = playerData;
        let rank = "";

        if (totalPoints >= rank6) rank = "Rank 6"; // 50+ points
        else if (totalPoints >= rank5) rank = "Rank 5"; // 40 - 50 points
        else if (totalPoints >= rank4) rank = "Rank 4"; // 30 - 40 points
        else if (totalPoints >= rank3) rank = "Rank 3"; // 20 - 30 points
        else if (totalPoints >= rank2) rank = "Rank 2"; // 10 - 20 points
        else if (totalPoints > rank1) rank = "Rank 1"; // 0.1 - 10 points
        else rank = "No Rank"; // 0 points

        ranks[playerName] = rank;
    }

    const rankArray = Object.entries(ranks).map(([playerName, rank]) => ({ playerName, rank }));
    rankArray.sort((a, b) => rankOrder[b.rank] - rankOrder[a.rank]);

    await writeToFile(rankArray, exportfilename, TEMP_DIR);
    return rankArray;
}