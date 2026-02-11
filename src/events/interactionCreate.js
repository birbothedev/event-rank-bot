import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { commands } from '../commands/commands.js';
import { Events } from 'discord.js';

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {

        /* -------- SLASH COMMANDS -------- */
        if (interaction.isChatInputCommand()) {
            const command = commands.find(
                cmd => cmd.data.name === interaction.commandName
            );

            if (!command) return;
            return command.execute(interaction);
        }

        /* -------- BUTTONS -------- */
        if (interaction.isButton()) {
            const handlers = await loadHandlers('buttons');
            const handler = handlers.find(
                h => interaction.customId.startsWith(h.customId)
            );

            if (handler) return handler.execute(interaction);
        }

        /* -------- MODALS -------- */
        if (interaction.isModalSubmit()) {
            const handlers = await loadHandlers('modals');
            const handler = handlers.find(
                h => interaction.customId.startsWith(h.customId)
            );

            if (handler) return handler.execute(interaction);
        }

        /* -------- SELECT MENU -------- */
        if (interaction.isStringSelectMenu()) {
            const handlers = await loadHandlers('menus');
            const handler = handlers.find(
                h => interaction.customId.startsWith(h.customId)
            );

            if (handler) return handler.execute(interaction);
        }
    }
};

/* -------- helper -------- */

async function loadHandlers(folder) {
    const folderPath = path.join('./events/interactions', folder);
    const files = fs.readdirSync(folderPath);

    return Promise.all(
        files.map(async file => {
            const mod = await import(
                pathToFileURL(path.join(folderPath, file)).href
            );
            return mod.default;
        })
    );
}