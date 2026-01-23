import { ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle
} from 'discord.js';

export function createSignupActionRow(eventId){

    const signupbutton = new ButtonBuilder()
    // set button id to the correct event
    .setCustomId(`signupbutton:${eventId}`) 
    .setLabel('✍️ Sign Up')
    .setStyle(ButtonStyle.Primary);

    return new ActionRowBuilder()
        .addComponents(signupbutton);
}

// TODO add 'Change Account' button for players to change which account they are signed up under
// TODO add 'Check Account' button for players to check which account they are signed up under