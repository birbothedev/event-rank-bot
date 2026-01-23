import { ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder } from "discord.js";


export const signupModal = new ModalBuilder().setCustomId('signupmodal').setTitle('Sign Up');

const rsnInput = new TextInputBuilder()
    .setCustomId('rsninput')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('RSN of the account you will participate on.')
    .setMaxLength(20)
    .setMinLength(1)
    .setRequired(true);
const signupLabel = new LabelBuilder()
    .setLabel("Sign Up to Participate")
    .setDescription('Limit 1 account per player.')
    .setTextInputComponent(rsnInput);

signupModal.addLabelComponents(signupLabel);