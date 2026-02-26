import { MessageFlags } from "discord.js";
import 'dotenv/config';
import { getDraftState } from "../../../helpers/drafthelpers.js";

export default {
    customId: 'recruitbutton:', 
    type: 'button',
    async execute(interaction) {
        const eventId = interaction.customId.split(':')[1];
        const playerId = interaction.customId.split(':')[2];
        const userId = interaction.user.id;
        const CAPTAIN_ROLE_ID = process.env.CAPTAIN_ROLE_ID;
        
        // ensure only team captains can click recruit buttons
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member.roles.cache.has(CAPTAIN_ROLE_ID)) {
            return interaction.reply({
                content: "❌ You do not have permission to use this button.",
                flags: MessageFlags.Ephemeral
            });
        }

        // // ensure captains can only interact with buttons on their turn
        // const draft = await getDraftState(eventId);
        // const currentTurn = draft.captains[draft.turn_index || 0];
        // if (userId !== currentTurn.userId){
        //     return interaction.reply({
        //         content: "❌ Nice try. Please wait your turn.",
        //         flags: MessageFlags.Ephemeral
        //     });
        // }
        // TODO have player list for each rank, remove player from list on button click
        // TODO once that ranks list is empty, populate the next rank list of players?
        try {
            await interaction.reply({
                content: `button cliked: ${eventId}, ${playerId}`,
                flags: MessageFlags.Ephemeral
            });

            // delete the message and button once its clicked
            await interaction.message.delete().catch(err => {
                console.error("Failed to delete message:", err);
            });
        } catch (err) {
            console.error('Error:', err);
            await interaction.reply({
                content: '❌ Something went wrong while attempting to recruit this player.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};