import { ModalBuilder, TextInputBuilder, TextInputStyle, LabelBuilder } from "discord.js";


export function createSignUpModal(eventId){
    // create sign up modal
    const signupModal = new ModalBuilder()
        .setCustomId(`signupmodal:${eventId}`)
        .setTitle('Event Sign Up');
    
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
        .setMaxLength(20)
        .setMinLength(1)
        .setRequired(true);
    const changeaccountLabel = new LabelBuilder()
        .setLabel("Change Account")
        .setDescription('Limit 1 account per player.')
        .setTextInputComponent(changersnInput);

    changeaccountModal.addLabelComponents(changeaccountLabel);

    return changeaccountModal;
}