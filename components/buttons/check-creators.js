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

		if (!response) {
			return interaction.editReply({
				content:
					"There was an error retrieving your information. Please try again later.",
			});
		}
		if (!response.total) {
			return interaction.editReply({
				content: "You are not a Jungo Creator.",
			});
		}

		const data = {
			discordId: response.items[0].fields["Discord ID"],
			username:
				response.items[0].fields["Discord Name"] ?? interaction.user.username,
			jungoId: response.items[0].fields["Jungo ID"]?.[0]?.text ?? "N/A",
			region: response.items[0].fields["Region"]?.[0]?.text ?? "N/A",
			monthlyViews: response.items[0].fields["Monthly Views"] ?? 0,
			boostedViews: response.items[0].fields["Boosted Views"] ?? 0,
			finalViews: response.items[0].fields["Final Views"] ?? 0,
			rank: response.items[0].fields["Rank"]?.[0]?.text ?? "N/A",
			giftCode: response.items[0].fields["Gift Code"] ?? "N/A",
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
					name: "Rank (Total Views - Boosted Views)",
					value: `${data.rank} (${data.finalViews.toString()})`,
					inline: false,
				},
				{ name: "Gift Code", value: data.giftCode, inline: false }
			)
			.setTimestamp();

		await interaction.editReply({
			embeds: [embed],
		});
	},
};
