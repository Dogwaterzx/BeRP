const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { CLIENTID, GUILDID, TOKEN } = require('../config.json');

const commands = [
    new SlashCommandBuilder().setName('list-players').setDescription('Gets a list of people currently on classic.'),
	new SlashCommandBuilder().setName('realm-whitelist').setDescription('Whitelist Players From device ban.').addStringOption((option) => option.setName('gamertag').setDescription('The player you want to whitelist via their gamertag').setRequired(true)),
	new SlashCommandBuilder().setName('realm-unwhitelist').setDescription('Removes gamertag From Whitelist').addStringOption((option) => option.setName('gamertag').setDescription('The gamertag u Want to Remove From The Whitelist').setRequired(true)),

].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(TOKEN);

(async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands(CLIENTID, GUILDID),
			{ body: commands },
		);

		console.log('Successfully registered application commands.');
	} catch (error) {
		console.error(error);
	}
})();
