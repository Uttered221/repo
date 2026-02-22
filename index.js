require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

/* =========================
   DEBUG TOKEN CHECK
========================= */
console.log("=== DEBUG START ===");

console.log(
  "ENV has TOKEN:",
  Object.prototype.hasOwnProperty.call(process.env, "TOKEN")
);

console.log("TOKEN TYPE:", typeof process.env.TOKEN);

if (process.env.TOKEN) {
  console.log("TOKEN LENGTH:", process.env.TOKEN.length);
  console.log("TOKEN FIRST 5:", process.env.TOKEN.slice(0, 5));
  console.log("TOKEN LAST 5:", process.env.TOKEN.slice(-5));
} else {
  console.log("TOKEN VALUE IS UNDEFINED OR EMPTY");
}

console.log("=== DEBUG END ===");
/* ========================= */

client.login(process.env.TOKEN);
