import Discord, { Snowflake, Interaction, GuildMember } from "discord.js";
import { createAudioPlayer, joinVoiceChannel } from "@discordjs/voice";
import { REST } from "@discordjs/rest";
import { ROUTES } from "discord-api-types/v10";
import fs from "node:fs";
import { Player } from "discord-player";

import { prefix, token, clientID, guildID } from "./config.json";

const CLIENT_ID = clientID;
const GUILD_ID = guildID;

const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_VOICE_STATES"],
});
