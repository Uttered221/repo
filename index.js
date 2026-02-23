// ===== ENV =====
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// ===== REQUIRE FILES =====
require('./core/utils/helpers')
const loadDB = require("./core/database");
const { Client, GatewayIntentBits } = require("discord.js");
const { brain } = require("./core/brain");
// ===== CREATE CLIENT =====
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ===== CHECK ENV =====
if (!TOKEN || !CLIENT_ID) {
    console.error("TOKEN หรือ CLIENT_ID หาย");
    process.exit(1);
}

// ===== READY EVENT =====
client.once("ready", async () => {
    console.log(`🔥 บอทออนไลน์แล้ว: ${client.user.tag}`);
    
    try {
        await loadDB();
        await registerCommands(client);
        console.log("✅ โหลดระบบเรียบร้อย");
    } catch (err) {
        console.error("❌ มี error ตอนเริ่มระบบ:", err);
    }
}
});

// ===== INTERACTION BRAIN =====
client.on("interactionCreate", async (interaction) => {
  try {
    await brain(interaction);
  } catch (err) {
    console.error("Brain error:", err);
  }
});

// ==== LOGIN ====
client.login(TOKEN);
