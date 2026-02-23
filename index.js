const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const registerCommands = require("./core/utils/helpers");
const handleInteraction = require("./core/interactionHandler");
const loadDB = require("./core/database");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

if (!TOKEN || !CLIENT_ID) {
  console.error("TOKEN หรือ CLIENT_ID หาย");
  process.exit(1);
}

client.once("ready", async () => {
  console.log(`🔥 บอทออนไลน์: ${client.user.tag}`);
  await loadDB();
  await registerCommands(client);
});

client.on("interactionCreate", async (interaction) => {
  handleInteraction(interaction, client);
});

client.login(TOKEN);
