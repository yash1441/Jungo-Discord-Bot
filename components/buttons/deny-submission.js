const { EmbedBuilder, userMention, MessageFlags } = require("discord.js");
require("dotenv").config();

module.exports = {
	data: {
		name: "deny-submission",
	},
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const embed = interaction.message.embeds[0];

		const deniedEmbed = EmbedBuilder.from(embed)
			.setColor(process.env.EMBED_COLOR_DENIED)
			.addFields({
				name: "Decision",
				value: userMention(interaction.user.id),
				inline: true,
			});

		await interaction.message
			.edit({ embeds: [deniedEmbed], components: [] })
			.then(() => interaction.deleteReply());
	},
};
