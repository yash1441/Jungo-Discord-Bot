const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const lark = require("../../utils/lark.js");
require("dotenv").config();

module.exports = {
	cooldown: 5,
	category: "utility",
	data: new SlashCommandBuilder()
		.setName("creators")
		.setDescription("Commands related to the creators database")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("reload")
				.setDescription("Reloads the creators database")
		),
	async execute(interaction) {
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});

		if (interaction.options.getSubcommand() === "reload") {
			const response = await lark.listRecords(
				process.env.CREATOR_BASE,
				process.env.APPLICATION_TABLE,
				{ filter: `CurrentValue.[Status] = "Accepted"` }
			);

			if (!response || !response.total) {
				return interaction.editReply({
					content: "No creators found",
				});
			}

            console.log(response.items);

            await interaction.editReply({
                content: "Creators reloaded",
		}
	},
};
