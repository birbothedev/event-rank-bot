import { ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle
} from 'discord.js';

export function createSignupActionRow(eventId){

    const signupbutton = new ButtonBuilder()
        // set button id to the correct event
        .setCustomId(`signupbutton:${eventId}`) 
        .setLabel('📝 Sign Up')
        .setStyle(ButtonStyle.Primary);

    const changeAccountButton = new ButtonBuilder()
        .setCustomId(`changeAccountButton:${eventId}`)
        .setLabel('✍️ Change Account')
        .setStyle(ButtonStyle.Secondary)

    const checkAccountButton = new ButtonBuilder()
        .setCustomId(`checkAccountButton:${eventId}`)
        .setLabel('❓ Check Account')
        .setStyle(ButtonStyle.Secondary)

    return new ActionRowBuilder()
        .addComponents(signupbutton, checkAccountButton, changeAccountButton);
}