const { Client, GatewayIntentBits } = require("discord.js");
const registerCommands = require("./utils/helpers");
const handleInteraction = require("./core/interactionHandler");
const { loadDB } = require("./core/database");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const TOKEN = process.env.TOKEN;

client.once("ready", async () => {
  console.log(`🔥 บอทออนไลน์: ${client.user.tag}`);
  loadDB();
  await registerCommands(client);
});

client.on("interactionCreate", async (interaction) => {
  handleInteraction(interaction, client);
});

client.login(TOKEN);
