const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skips the current song."),
  run: async ({ client, interaction }) => {
    const queue = client.player.getQueue(interaction.guildId);

    if (!queue)
      return await interaction.editReply("Currently no songs in the queue");

    const currentSong = queue.current;

    queue.skip();
    await interaction.editReply({
      embeds: [
        new MessageEmbed()
          .setDescription(`${currentSong.title} skipped.`)
          .setThumbnail(currentSong.thumbnail),
      ],
    });
  },
};
