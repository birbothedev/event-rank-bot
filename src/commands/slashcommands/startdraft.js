import { SlashCommandBuilder, MessageFlags, ChannelType } from 'discord.js';
import { getPlayerListFromDB, getUpdatedEventsList } from '../../helpers/helperfunctions.js';
import 'dotenv/config';
import { addCaptainsToDB, areCaptainsAlreadyShuffled, decideCaptainOrder, displayDraftMessages, getCaptainsFromDB } from '../../helpers/drafthelpers.js';

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
        const eventId = interaction.options.getString('eventid');
        const channel = interaction.channel;

        // delete old draft messages in case of restart
        if (channel && channel.type === ChannelType.GuildText) {
            const messages = await channel.messages.fetch({ limit: 50 });
            const botMessages = messages.filter(
                m => m.author.id === interaction.client.user.id );
            for (const [id, msg] of botMessages) {
                await msg.delete().catch(console.error);
            }
        }

        await interaction.deferReply({ 
            flags: MessageFlags.Ephemeral 
        });
        try {
            await interaction.editReply({
                content: '🟢 Displaying players for draft...',
                flags: MessageFlags.Ephemeral
            });

            // draft messages
            const rankOrder = ["Rank 6", "Rank 5", "Rank 4", "Rank 3", "Rank 2", "Rank 1"];
            const players = await getPlayerListFromDB(eventId);
            await displayDraftMessages(players, rankOrder, 0, eventId, channel);


            // only shuffle captains if not already shuffled in db
            const shuffledcaptains = await areCaptainsAlreadyShuffled(eventId);
            if (!shuffledcaptains || shuffledcaptains === 0){
                console.log("attempting to shuffle captains");
                const captainOrder = await decideCaptainOrder(eventId);
                await addCaptainsToDB(eventId, 1, captainOrder);
            }

            // display captain order message
            const captainsString = await getCaptainsFromDB(eventId);
            const captainsArray = JSON.parse(captainsString.captains);
            const styledCaptainsText = captainsArray
                .map(name => name.rsn.toUpperCase())
                .join(' -> ');
            const captainsText = `**Captain Order: ${styledCaptainsText}**`;
            await channel.send({ content: captainsText });

        } catch (error){
            console.error('Error:', error);
            await interaction.editReply({
                content: '❌ Something went wrong while attempting to display players for the draft.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}