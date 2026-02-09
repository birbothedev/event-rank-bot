import { writeToFile } from "./output.js"

async function getValuePerSkill(rawData){
    const playerSkillData = rawData.map(player => ({
        playerName: player.playerName,
        playerClanRank: player.playerClanRank,
        skills: Object.fromEntries(
            Object.entries(player.latestSnapshot.data.skills).map(([skillName, skillData]) => [
                skillName,
                skillData.experience
            ])
        )
    }));

    return playerSkillData;
}

async function getValuePerBoss(rawData){
    const playerBossData = rawData.map(player => ({
        playerName: player.playerName,
        bosses: Object.fromEntries(
            Object.entries(player.latestSnapshot.data.bosses).map(([bossName, bossData]) => [
                bossName,
                bossData.kills
            ])
        )
    }));

    return playerBossData;
}

async function getValuePlayerEfficiency(rawData){
    const playerEfficiencyData = rawData.map(player => ({
        playerName: player.playerName,
        efficiency: Object.fromEntries(
            Object.entries(player.latestSnapshot.data.computed).map(([efficiencyName, efficiencyData]) => [
                efficiencyName,
                efficiencyData.value
            ])
        )
    }));

    return playerEfficiencyData;
}

export async function combineDataAndWriteToFile(rawData, exportfilename, TEMP_DIR){
    const playerSkillData = await getValuePerSkill(rawData);
    const playerBossData = await getValuePerBoss(rawData);
    const playerEfficiencyData = await getValuePlayerEfficiency(rawData);

    const allDataMerged = playerSkillData.map(skillItem => {
        const playerName = skillItem.playerName;
        const playerClanRank = skillItem.playerClanRank;
        const bossItem = playerBossData.find(b => b.playerName === playerName);
        const efficiencyItem = playerEfficiencyData.find(e => e.playerName === playerName);

        console.log("player clan rank: ", playerClanRank);

        return {
            playerName, 
            playerClanRank,
            data: {
                skills: skillItem.skills,
                bosses: bossItem ? bossItem.bosses : {},
                efficiency: efficiencyItem ? efficiencyItem.efficiency : {}
            }
        }
    });

    // TODO delete raw data file after use
    await writeToFile(allDataMerged, exportfilename, TEMP_DIR);
    return allDataMerged;
}