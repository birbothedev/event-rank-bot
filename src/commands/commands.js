import { readdirSync } from 'fs';
import path from 'path';
import { pathToFileURL, fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
const commandsPath = path.join(__dirname, 'slashcommands');

const commandFiles = readdirSync(commandsPath)
	.filter(file => file.endsWith('.js') && file !== 'commands.js');

for (const file of commandFiles){
	const filePath = path.join(commandsPath, file);
	const command = (await import(pathToFileURL(filePath).href)).default;

	commands.push(command);
}

export { commands };