import {
	Client,
	GatewayIntentBits,
	REST,
	Routes,
} from 'discord.js';
import 'dotenv/config';
import { commands } from './commands/commands.js';
import { readdirSync } from 'fs';
import { pathToFileURL } from 'url';
import path from "path";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const token = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

const client = new Client({
	intents: [GatewayIntentBits.Guilds]
});

/* -----------------------------
Register slash commands
----------------------------- */
const rest = new REST({ version: '10' }).setToken(token);

await rest.put(
	Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
	{ body: commands.map(cmd => cmd.data.toJSON()) }
);


/* -----------------------------
Register events
----------------------------- */
const eventsPath = path.join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles){
	const filePath = path.join(eventsPath, file);
	const fileUrl = pathToFileURL(filePath); 
    const event = (await import(fileUrl.href)).default;

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(token);

