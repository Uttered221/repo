// ===== ENV =====
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// ===== REQUIRE FILES =====
const registerCommands = require("./core/core/utils/helpers");
const loadDB = require("./core/database");
const { Client, GatewayIntentBits } = require("discord.js");

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
});

// ===== LOGIN =====
client.login(TOKEN);
