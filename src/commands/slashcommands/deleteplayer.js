import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { deleteplayer, getPlayerListFromDB } from '../../helpers/helperfunctions.js';

export default {
    data: new SlashCommandBuilder()
        .setName('deleteplayer')
        .setDescription('Removes a player from the signups database.')
        .addStringOption(option => 
            option
                .setName('eventid')
                .setDescription(`The event's corresponding id.`)
                .setRequired(true)
        )
        .addStringOption(option => 
            option
                .setName('rsn')
                .setDescription(`The RSN of the player you wish to remove.`)
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction){
        const eventId = interaction.options.getString('eventid');
        const rsnOption = interaction.options.getFocused(true);

        const playerList = await getPlayerListFromDB(eventId);
        const choices = playerList.map(c => c.rsn);
        const filtered = choices.filter(choice => choice.startsWith(rsnOption.value));

        await interaction.respond(
            filtered.slice(0, 25).map(choice => ({name: choice, value: choice}))
        );
    },

    async execute(interaction) {
        const eventId = interaction.options.getString('eventid');
        const rsn = interaction.options.getString('rsn');

        await interaction.deferReply({ 
            flags: MessageFlags.Ephemeral
        });
        try {
            const deletedPlayers = await deleteplayer(eventId, rsn);
            console.log("deleted player: ", deletedPlayers)
            if (deletedPlayers > 0){
                await interaction.editReply({
                    content: '✅ Successfully removed the player from the db.',
                    flags: MessageFlags.Ephemeral
                });
            }
            
        } catch (error){
            console.error('Error:', err);
            await interaction.editReply({
                content: '❌ Something went wrong while attempting to remove the player from the db.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}