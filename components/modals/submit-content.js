const {
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	MessageFlags,
	hyperlink,
} = require("discord.js");
require("dotenv").config();

module.exports = {
	data: {
		name: "submit-content",
	},
	async execute(interaction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const channel = await interaction.client.channels.fetch(
			process.env.DECIDE_CONTENT_ID
		);

		const region = await interaction.fields.getTextInputValue("region");
		const theme = await interaction.fields.getTextInputValue("theme");
		const url = await interaction.fields.getTextInputValue("url");

		if (!isValidUrl(url)) {
			return await interaction.editReply({
				content: "The provided URL is invalid. Please try again.",
			});
		}

		const platform = getPlatform(url.toLowerCase());

		sendSubmissionAdmin(
			region,
			theme,
			url,
			platform,
			channel,
			interaction.user
		);

		await interaction.editReply({
			content:
				"Your submission has been sent to the moderation team for review and submission.",
		});
	},
};

function isValidUrl(string) {
	try {
		new URL(string);
		return true;
	} catch {
		return false;
	}
}

function getPlatform(url) {
	if (url.includes("youtube")) return "YouTube";
	if (url.includes("twitch")) return "Twitch";
	if (url.includes("twitter") || url.includes("x.com")) return "X";
	if (url.includes("instagram")) return "Instagram";
	if (url.includes("facebook")) return "Facebook";
	if (url.includes("tiktok")) return "TikTok";
	if (url.includes("reddit")) return "Reddit";
	return "Other";
}

function sendSubmissionAdmin(region, theme, url, platform, channel, user) {
	const embed = new EmbedBuilder()
		.setTitle(platform)
		.setDescription(theme)
		.addFields({ name: "Region", value: region, inline: true })
		.addFields({ name: "URL", value: hyperlink("View", url), inline: true })
		.setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
		.setFooter({ text: user.id })
		.setColor(process.env.EMBED_COLOR);

	const approveButton = new ButtonBuilder()
		.setCustomId("approve-submission")
		.setLabel("Approve")
		.setStyle(ButtonStyle.Success);

	const denyButton = new ButtonBuilder()
		.setCustomId("deny-submission")
		.setLabel("Deny")
		.setStyle(ButtonStyle.Danger);

	const row = new ActionRowBuilder().addComponents(approveButton, denyButton);

	channel.send({ embeds: [embed], components: [row] });
}
