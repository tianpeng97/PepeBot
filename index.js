const { Client, Collection } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = require("node:fs");
const { Player } = require("discord-player");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: ["GUILDS", "GUILD_VOICE_STATES"],
});

client.slashcommands = new Collection();
client.player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  },
});

let commands = [];

const slashFiles = fs
  .readdirSync("./slashCommands")
  .filter((file) => file.endsWith(".js"));

for (const file of slashFiles) {
  const slashCmd = require(`./slashCommands/${file}`);
  client.slashcommands.set(slashCmd.data.name, slashCmd);
  commands.push(slashCmd.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(TOKEN);

client.once("ready", () => {
  // change routes to applicationCommands(CLIENT_ID) to make commands global
  (async () => {
    await rest
      .put(Routes.applicationCommands(CLIENT_ID), {
        body: commands,
      })
      .then(() => {
        console.log("Loaded commands!");
      })
      .catch((error) => {
        if (error) {
          console.log(error);
          process.exit(1);
        }
      });
  })();

  console.log(`Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", (interaction) => {
  async function handleCmd() {
    if (!interaction.isCommand()) return;

    const slashCmd = client.slashcommands.get(interaction.commandName);
    if (!slashCmd) interaction.reply("Not a valid command.");

    await interaction.deferReply();
    await slashCmd.run({ client, interaction });
  }

  handleCmd();
});

client.login(TOKEN);
