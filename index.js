const fs = require("node:fs");
const path = require("node:path");
const {
	Client,
	GatewayIntentBits,
	Partials,
	Collection,
} = require("discord.js");
require("dotenv").config();
require("./deploy-commands.js");

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
client.buttons = new Collection();
client.modals = new Collection();
client.cooldowns = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ("data" in command && "execute" in command) {
			client.commands.set(command.data.name, command);
			console.log(`[INFO] Command ${command.data.name} loaded.`);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			);
		}
	}
}

const componentFoldersPath = path.join(__dirname, "components");
const componentFolders = fs.readdirSync(componentFoldersPath);

for (const folder of componentFolders) {
	const componentPath = path.join(componentFoldersPath, folder);

	if (folder === "buttons") {
		const buttonFiles = fs
			.readdirSync(componentPath)
			.filter((file) => file.endsWith(".js"));
		for (const file of buttonFiles) {
			const filePath = path.join(componentPath, file);
			const button = require(filePath);
			if ("data" in button && "execute" in button) {
				client.buttons.set(button.data.name, button);
				console.log(`[INFO] Button ${button.data.name} loaded.`);
			} else {
				console.log(
					`[WARNING] The button at ${filePath} is missing a required "data" or "execute" property.`
				);
			}
		}
	} else if (folder === "modals") {
		const modalFiles = fs
			.readdirSync(componentPath)
			.filter((file) => file.endsWith(".js"));
		for (const file of modalFiles) {
			const filePath = path.join(componentPath, file);
			const modal = require(filePath);
			if ("data" in modal && "execute" in modal) {
				client.modals.set(modal.data.name, modal);
				console.log(`[INFO] Modal ${modal.data.name} loaded.`);
			} else {
				console.log(
					`[WARNING] The modal at ${filePath} is missing a required "data" or "execute" property.`
				);
			}
		}
	}
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
	.readdirSync(eventsPath)
	.filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(process.env.BOT_TOKEN);
