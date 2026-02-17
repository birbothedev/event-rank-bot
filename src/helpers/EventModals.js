import { ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

export function createSignUpModal(eventId){
    // create sign up modal
    const signupModal = new ModalBuilder()
        .setCustomId(`signupmodal:${eventId}`)
        .setTitle('Event Sign Up');
    
    const rsnInput = new TextInputBuilder()
        .setCustomId('rsninput')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('RSN of the account you will participate on.')
        .setMaxLength(12)
        .setMinLength(1)
        .setRequired(true);
    const signupLabel = new LabelBuilder()
        .setLabel("Sign Up to Participate")
        .setDescription('Limit 1 account per player.')
        .setTextInputComponent(rsnInput);

    const selectMenu = new StringSelectMenuBuilder()
    .setCustomId('timezoneinput')
    .setPlaceholder('Choose your region')
    .addOptions(
        new StringSelectMenuOptionBuilder().setLabel('NA').setValue('na').setEmoji('❤️'),
        new StringSelectMenuOptionBuilder().setLabel('EU').setValue('eu').setEmoji('💙'),
        new StringSelectMenuOptionBuilder().setLabel('Asia').setValue('asia').setEmoji('💛'),
        new StringSelectMenuOptionBuilder().setLabel('LATAM').setValue('latam').setEmoji('💜'),
        new StringSelectMenuOptionBuilder().setLabel('OCE').setValue('oce').setEmoji('💚')
    );

    const selectMenuLabel = new LabelBuilder()
    .setLabel('Select Region')
    .setStringSelectMenuComponent(selectMenu);

    signupModal.addLabelComponents(signupLabel, selectMenuLabel);

    return signupModal;
}

export function createChangeAccountModal(eventId) {
    // create modal to change account
    const changeaccountModal = new ModalBuilder()
        .setCustomId(`changeaccountmodal:${eventId}`)
        .setTitle('Change Account');
    
    const changersnInput = new TextInputBuilder()
        .setCustomId('changersninput')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('RSN of the account you will participate on.')
        .setMaxLength(12)
        .setMinLength(1)
        .setRequired(true);
    const changeaccountLabel = new LabelBuilder()
        .setLabel("Change Account")
        .setDescription('Limit 1 account per player.')
        .setTextInputComponent(changersnInput);

    const changeaccountselectMenu = new StringSelectMenuBuilder()
    .setCustomId('changetimezoneinput')
    .setPlaceholder('Choose your region')
    .addOptions(
        new StringSelectMenuOptionBuilder().setLabel('NA').setValue('na').setEmoji('❤️'),
        new StringSelectMenuOptionBuilder().setLabel('EU').setValue('eu').setEmoji('💙'),
        new StringSelectMenuOptionBuilder().setLabel('Asia').setValue('asia').setEmoji('💛'),
        new StringSelectMenuOptionBuilder().setLabel('LATAM').setValue('latam').setEmoji('💜'),
        new StringSelectMenuOptionBuilder().setLabel('OCE').setValue('oce').setEmoji('💚')
    );

    const changeaccountselectMenuLabel = new LabelBuilder()
    .setLabel('Select Region')
    .setStringSelectMenuComponent(changeaccountselectMenu);

    changeaccountModal.addLabelComponents(changeaccountLabel, changeaccountselectMenuLabel);

    return changeaccountModal;
}