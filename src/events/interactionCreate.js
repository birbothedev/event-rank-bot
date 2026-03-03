import fs from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';
import { commands } from '../commands/commands.js';
import { Events, MessageFlags } from 'discord.js';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_ROLE_ID = process.env.MODERATOR_ROLE_ID;

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {

        if (interaction.isAutocomplete()) {
            const command = commands.find(
                cmd => cmd.data.name === interaction.commandName
            );
            if (command?.autocomplete) {
                return command.autocomplete(interaction);
            }
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

        /* -------- SLASH COMMANDS -------- */
        if (interaction.isChatInputCommand()) {
            if (!interaction.member.roles.cache.has(ALLOWED_ROLE_ID)) {
                return interaction.reply({
                    content: "❌ You don't have permission to use commands!",
                    flags: MessageFlags.Ephemeral
                });
            }
            const command = commands.find(
                cmd => cmd.data.name === interaction.commandName
            );

            if (!command) return;
            return command.execute(interaction);
        }
    }
};

/* -------- helper -------- */

async function loadHandlers(folder) {
    const folderPath = path.join(__dirname, 'interactions', folder);

    if (!fs.existsSync(folderPath)) {
        console.warn(`⚠️ Handler folder missing: ${folderPath}`);
        return [];
    }

    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));

    return Promise.all(
        files.map(async file => {
            const mod = await import(
                pathToFileURL(path.join(folderPath, file)).href
            );
            return mod.default;
        })
    );
}