import { EmbedBuilder } from 'discord.js';

// inside a command, event listener, etc.
export const eventEmbed = new EmbedBuilder()
	.setColor(0x0099ff)
	.addFields(
		{ name: 'Total Sign Ups', value: '0', inline: true },
	)
	.setTimestamp()
	.setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
