import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import { getUpdatedEventsList } from "./helperfunctions.js";


export async function buildEventSelectMenu(context){
    const events = await getUpdatedEventsList();

    const selectOptions = events.map(event => 
        new StringSelectMenuOptionBuilder()
            .setLabel(event.name)
            .setValue(event.id.toString())
        );

    const selectEvent = new StringSelectMenuBuilder()
        .setCustomId(`eventselect:${context}`)
        .setPlaceholder('Select an Event')
        .addOptions(selectOptions.slice(0, 25));

    return new ActionRowBuilder().addComponents(selectEvent);
}
