const { EmbedBuilder, userMention, MessageFlags } = require("discord.js");
const lark = require("../../utils/lark.js");
require("dotenv").config();

module.exports = {
	data: {
		name: "approve-submission",
	},
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const embed = interaction.message.embeds[0];

		const approvedEmbed = EmbedBuilder.from(embed)
			.setColor(process.env.EMBED_COLOR_APPROVED)
			.addFields({
				name: "Decision",
				value: userMention(interaction.user.id),
				inline: true,
			});

		await sendSubmissionLark(approvedEmbed.data);

		await interaction.message
			.edit({ embeds: [approvedEmbed], components: [] })
			.then(() => interaction.deleteReply());
	},
};

async function sendSubmissionLark(embed) {
	const platform = embed.title;
	const theme = embed.description;
	const discordId = embed.footer.text;
	const discordUsername = embed.author.name;
	const region = embed.fields[0].value;
	const url = embed.fields[1].value.replace("[View](", "").replace(")", "");
	const jungoId = embed.fields[2].value;

	await lark.createRecord(
		process.env.CREATOR_BASE,
		process.env.SUBMISSION_TABLE,
		{
			fields: {
				"Discord ID": discordId,
				"Discord Name": discordUsername,
				"Jungo ID": jungoId,
				Region: region,
				Platform: platform,
				Theme: theme,
				Link: {
					link: url,
					text: url,
				},
			},
		}
	);
}
