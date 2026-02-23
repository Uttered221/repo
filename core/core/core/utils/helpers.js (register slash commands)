const { SlashCommandBuilder, REST, Routes } = require("discord.js");

const CLIENT_ID = process.env.CLIENT_ID;
const TOKEN = process.env.TOKEN;

async function registerCommands(client) {

  const commands = [
    new SlashCommandBuilder()
      .setName("game")
      .setDescription("สร้างห้องเกม")
      .addStringOption(option =>
        option.setName("type")
          .setDescription("เลือกเกม")
          .setRequired(true)
          .addChoices(
            { name: "Uno", value: "uno" },
            { name: "Blackjack", value: "blackjack" },
            { name: "Slot", value: "slot" },
            { name: "Dice", value: "dice" }
          )
      )
  ].map(c => c.toJSON());

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    console.log("⏳ กำลังลงทะเบียนคำสั่ง...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("✅ ลงทะเบียนคำสั่งเรียบร้อย");
  } catch (err) {
    console.error("❌ ลงทะเบียนคำสั่งล้มเหลว:", err);
  }
}

module.exports = registerCommands;
