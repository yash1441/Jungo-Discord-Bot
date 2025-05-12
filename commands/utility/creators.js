const { SlashCommandBuilder, MessageFlags, bold } = require("discord.js");
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
				if (!isValidDiscordId(discordId)) {
					await lark.updateRecord(
						process.env.CREATOR_BASE,
						process.env.APPLICATION_TABLE,
						record.record_id,
						{ fields: { Status: "Incorrect" } }
					);
					continue;
				}
				await interaction.guild.members
					.fetch(discordId)
					.then(async (member) => {
						await member.roles.add(process.env.JUNGO_CREATOR_ROLE).then(() => {
							records.push(record.record_id);
							interaction.client.users
								.send(discordId, {
									content:
										bold(
											"Congratulations, you are now officially a Jungo Creator!"
										) +
										"\nYou've unlocked access to the exclusive submission channel and are eligible for monthly rewards!\nIf the video you used in your application was a JungoJam-related post published after " +
										bold("March 27") +
										", please resubmit it in <#1350671187927240737> to ensure your rewards are accurately processed.\nCreator rewards will be refreshed every month—can't wait to see more of your amazing content!",
								})
								.catch((error) => {
									console.error(
										`Failed to send message to user ${discordId}: ${JSON.parse(
											error.rawError
										)}`
									);
								});
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

function isValidDiscordId(id) {
	return /^\d{17,19}$/.test(id);
}
