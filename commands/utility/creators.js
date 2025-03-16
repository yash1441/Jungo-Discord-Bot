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
			let records = [];
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

			for (const record of response.items) {
				const discordId = record.fields["Discord ID"];
				await interaction.guild.members
					.fetch(discordId)
					.then(async (member) => {
						await member.roles.add(process.env.JUNGO_CREATOR_ROLE).then(() => {
							records.push(record.record_id);
						});
					})
					.catch((error) => console.error(error));
			}

			for (const record of records) {
				await lark.updateRecord(
					process.env.CREATOR_BASE,
					process.env.APPLICATION_TABLE,
					record,
					{ fields: { Status: "Role Given" } }
				);
			}

			await interaction.editReply({
				content: "Creators reloaded",
			});
		}
	},
};
