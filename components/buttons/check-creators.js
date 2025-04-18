const { EmbedBuilder, userMention, MessageFlags } = require("discord.js");
const lark = require("../../utils/lark.js");
require("dotenv").config();

module.exports = {
	data: {
		name: "check-creators",
	},
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const response = await lark.listRecords(
			process.env.CREATOR_BASE,
			process.env.CREATOR_TABLE,
			{ filter: `CurrentValue.[Discord ID] = "${interaction.user.id}"` }
		);

		if (!response || !response.total) {
			return interaction.editReply({
				content: "You are not a Jungo Creator.",
			});
		}

		const data = {
			discordId: response.items[0].fields["Discord ID"],
			username: response.items[0].fields["Discord Name"],
			jungoId: response.items[0].fields["Jungo ID"],
			region: response.items[0].fields["Region"],
			monthlyViews: response.items[0].fields["Monthly Views"],
			rank: response.items[0].fields["Rank"],
		};

		const embed = new EmbedBuilder()
			.setColor("#0099ff")
			.setTitle("Jungo Creator Information")
			.setDescription("Here is your Jungo Creator information:")
			.addFields(
				{
					name: "Discord ID",
					value: userMention(data.discordId),
					inline: true,
				},
				{ name: "Jungo ID", value: data.jungoId, inline: true },
				{ name: "Region", value: data.region, inline: true },
				{
					name: "Monthly Views",
					value: data.monthlyViews.toString(),
					inline: true,
				},
				{ name: "Rank", value: data.rank, inline: true }
			)
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed],
		});
	},
};
