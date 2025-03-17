const {
	EmbedBuilder,
	userMention,
	hyperlink,
	bold,
	MessageFlags,
} = require("discord.js");
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

		await sendSubmissionLark(interaction, approvedEmbed);

		await interaction.message
			.edit({ embeds: [approvedEmbed], components: [] })
			.then(() => interaction.deleteReply());
	},
};

async function sendSubmissionLark(embedData) {
	console.log(embedData.data);
}
