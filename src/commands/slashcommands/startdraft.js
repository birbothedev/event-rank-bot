import { SlashCommandBuilder, MessageFlags, ChannelType } from 'discord.js';
import { getUpdatedEventsList } from '../../helpers/helperfunctions.js';
import 'dotenv/config';
import { rankOrder, addCaptainsToDB, areCaptainsAlreadyShuffled, decideCaptainOrder, displayDraftMessages, getCaptainsFromDB, getPlayersByRank, getRankOrderIndex, advanceRankIndex, updateDraftedStateForUser, updateRankIndex, assignTeamsToCaptains } from '../../helpers/drafthelpers.js';

// TODO add rank field to start draft command and run it for each individual rank rather than having to loop the command based on when the rank is finished
export default {
    data: new SlashCommandBuilder()
        .setName('startdraft')
        .setDescription('Starts the Team Draft.')
        .addStringOption(option => 
            option
                .setName('eventid')
                .setDescription(`The event that the draft will take place for.`)
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction){
        const eventname = interaction.options.getFocused(true);
        const eventList = await getUpdatedEventsList();
        const choices = eventList.map(e => ({name: e.name, id: e.id}));
        const filtered = choices.filter(choice => choice.name.startsWith(eventname.value));
        await interaction.respond(
            filtered.slice(0, 25).map(choice => ({name: choice.name, value: choice.id.toString()}))
        );
    },

    async execute(interaction) {
        await interaction.deferReply({ 
            flags: MessageFlags.Ephemeral 
        });
        const eventId = interaction.options.getString('eventid');
        const channel = interaction.channel;
        const messages = await channel.messages.fetch({ limit: 50 });
        const botMessages = messages.filter(
            m => m.author.id === interaction.client.user.id );
        // delete old draft messages in case of restart
        if (channel && channel.type === ChannelType.GuildText) {
            for (const [id, msg] of botMessages) {
                await msg.delete().catch(console.error);
            }
        }

        try {
            await interaction.editReply({
                content: '🟢 Displaying players for draft...',
                flags: MessageFlags.Ephemeral
            });

            // only shuffle captains if not already shuffled in db
            const shuffledcaptains = await areCaptainsAlreadyShuffled(eventId);
            if (!shuffledcaptains || shuffledcaptains === 0){
                console.log("attempting to shuffle captains");
                const captainOrder = await decideCaptainOrder(eventId);
                await addCaptainsToDB(eventId, 1, captainOrder);
            }

            // TODO filter out captains from list of players before starting draft

            // draft messages
            let rankIndex = await getRankOrderIndex(eventId);
            let players = await getPlayersByRank(eventId, rankOrder[rankIndex.rank_index]);
            let attempts = 0;

            while (!players.some(p => p !== undefined && p !== null) && attempts < rankOrder.length) {
                console.log("attempting to advance rank index");
                await advanceRankIndex(eventId);
                rankIndex = await getRankOrderIndex(eventId);
                players = await getPlayersByRank(eventId, rankOrder[rankIndex.rank_index]);
                attempts++;
            }

            if (players.length === 0) {
                console.log("No players left to draft");
                return;
            }
            await displayDraftMessages(players, eventId, channel);

            // display captain order message
            const captainsString = await getCaptainsFromDB(eventId);
            const captainsArray = JSON.parse(captainsString.captains);
            const styledCaptainsText = captainsArray
                .map(name => name.rsn.toUpperCase())
                .join(' -> ');
            const captainsText = `**Captain Order: ${styledCaptainsText}**`;
            await channel.send({ content: captainsText });

            // assign team ids to each captain
            for (const [index, captain] of captainsArray.entries()){
                const userId = captain.userId;
                const rsn = captain.rsn;

                await assignTeamsToCaptains(index + 1, userId, rsn, eventId);
            }

        } catch (error){
            console.error('Error:', error);
            await interaction.editReply({
                content: '❌ Something went wrong while attempting to display players for the draft.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}