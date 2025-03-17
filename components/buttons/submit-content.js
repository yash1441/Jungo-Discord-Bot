const {
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
} = require("discord.js");
require("dotenv").config();

module.exports = {
	cooldown: 10,
	data: {
		name: "submit-content",
	},
	async execute(interaction) {
		const modal = new ModalBuilder()
			.setCustomId("submit-content")
			.setTitle("Submit Content");

		const regionInput = new TextInputBuilder()
			.setCustomId("region")
			.setLabel("Region")
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("What's your region/country?")
			.setRequired(true);

		const themeInput = new TextInputBuilder()
			.setCustomId("theme")
			.setLabel("Theme")
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("What's the theme of your content?")
			.setRequired(true);

		const urlInput = new TextInputBuilder()
			.setCustomId("url")
			.setLabel("URL")
			.setStyle(TextInputStyle.Short)
			.setPlaceholder("Link to your content")
			.setRequired(true);

		const firstActionRow = new ActionRowBuilder().addComponents(regionInput);
		const secondActionRow = new ActionRowBuilder().addComponents(themeInput);
		const thirdActionRow = new ActionRowBuilder().addComponents(urlInput);

		modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

		await interaction.showModal(modal);
	},
};
