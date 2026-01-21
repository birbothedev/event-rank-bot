import { ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle
} from 'discord.js';

const button1 = new ButtonBuilder()
    .setCustomId('button1') 
    .setLabel('✍️ Sign Up')
    .setStyle(ButtonStyle.Primary);

const button3 = new ButtonBuilder()
    .setCustomId('button3') 
    .setLabel('📌 About the Event')
    .setStyle(ButtonStyle.Secondary);

export const actionRow = new ActionRowBuilder()
    .addComponents(button1, button3);
