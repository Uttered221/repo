const { getUser, saveDB } = require("../core/data");
console.log("FILE LOADED");

const { Client, GatewayIntentBits } = require("discord.js");

// ==== ENV ====
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// ==== REQUIRE FILES ====
const { registerCommands } = require("../core/helpers");
const { brain } = require("../core/brain");

// ==== CREATE CLIENT ====
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// ==== CHECK ENV ====
if (!TOKEN || !CLIENT_ID) {
  console.error("TOKEN หรือ CLIENT_ID หาย");
  process.exit(1);
}

client.once("ready", async () => {
  console.log("บอทออนไลน์แล้ว: " + client.user.tag);

  try {
    loadDB();
    await registerCommands(client);
    console.log("โหลดฐานข้อมูลเรียบร้อย");
  } catch (err) {
    console.error("มี error ตอนเริ่มระบบ:", err);
  }
});

client.on("interactionCreate", async (interaction) => {
  try {
    await brain(interaction);
  } catch (err) {
    console.error("Brain error:", err);
  }
});

client.login(TOKEN);
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot running");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Web server started");
});
