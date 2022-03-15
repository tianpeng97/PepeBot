const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { QueryType } = require("discord-player");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Loads songs from YT.")
        .addSubcommand((subCmd) =>
            subCmd
                .setName("song")
                .setDescription("Loads a song using an URL.")
                .addStringOption((option) =>
                    option
                        .setName("url")
                        .setDescription("The song's URL.")
                        .setRequired(true)
                )
        )
        .addSubcommand((subCmd) =>
            subCmd
                .setName("playlist")
                .setDescription("Loads a playlist using an URL")
                .addStringOption((option) =>
                    option
                        .setName("url")
                        .setDescription("The playlist's URL.")
                        .setRequired(true)
                )
        )
        .addSubcommand((subCmd) =>
            subCmd
                .setName("search")
                .setDescription("Searches for song using keywords.")
                .addStringOption((option) =>
                    option
                        .setName("searchkeywords")
                        .setDescription("The search keywords.")
                        .setRequired(true)
                )
        ),
    run: async ({ client, interaction }) => {
        if (!interaction.member.voice.channel) {
            return interaction.editReply("You are not in a voice channel.");
        }

        const queue = await client.player.createQueue(interaction.guild);
        if (!queue.connection)
            await queue.connect(interaction.member.voice.channel);

        let embed = new MessageEmbed();

        if (interaction.options.getSubcommand() == "song") {
            let url = interaction.options.getString("url");
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO,
            });

            if (result.tracks.length === 0) {
                return interaction.editReply("No results found.");
            }

            const song = result.tracks[0];
            await queue.addTrack(song);
            embed
                .setDescription(
                    `**[${song.title}](${song.url})** has been added to the Queue`
                )
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}` });
        } else if (interaction.options.getSubcommand() == "playlist") {
            let url = interaction.options.getString("url");
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST,
            });

            if (result.tracks.length === 0) {
                return interaction.editReply("No results found.");
            }

            const playlist = result.playlist;
            await queue.addTracks(result.tracks);
            embed
                .setDescription(
                    `**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** has been added to the Queue.`
                )
                .setThumbnail(playlist.thumbnail);
        } else if (interaction.options.getSubcommand() == "search") {
            let url = interaction.options.getString("searchkeywords");
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO,
            });

            if (result.tracks.length === 0) {
                return interaction.editReply("No results found.");
            }

            const song = result.tracks[0];
            await queue.addTrack(song);
            embed
                .setDescription(
                    `**[${song.title}](${song.url})** has been added to the Queue`
                )
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}` });
        }
        if (!queue.playing) await queue.play();
        await interaction.editReply({
            embeds: [embed],
        });
    },
};
