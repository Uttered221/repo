const { SlashCommandBuilder, REST, Routes } = require("discord.js");

const CLIENT_ID = process.env.CLIENT_ID;
const TOKEN = process.env.TOKEN;

async function registerCommands(client) {

  const commands = [
  new SlashCommandBuilder().setName("uno").setDescription("เล่นเกม UNO"),
  new SlashCommandBuilder().setName("blackjack").setDescription("เล่น Blackjack"),
  new SlashCommandBuilder().setName("slot").setDescription("เล่นสล็อต"),
  new SlashCommandBuilder().setName("dice").setDescription("ทอยเต๋า"),
  new SlashCommandBuilder().setName("quiz").setDescription("ตอบคำถาม"),
  new SlashCommandBuilder().setName("hangman").setDescription("เล่น Hangman"),
  new SlashCommandBuilder().setName("numberguess").setDescription("ทายตัวเลข"),
  new SlashCommandBuilder().setName("duel").setDescription("ดวลผู้เล่น"),
  new SlashCommandBuilder().setName("boss").setDescription("สู้บอส"),
  new SlashCommandBuilder().setName("criticalbattle").setDescription("ศึกคริติคอล"),
  new SlashCommandBuilder().setName("diceroll").setDescription("สุ่มลูกเต๋า"),
  new SlashCommandBuilder().setName("speed").setDescription("เกมวัดความเร็ว"),
  new SlashCommandBuilder().setName("elementwar").setDescription("สงครามธาตุ"),
  new SlashCommandBuilder().setName("daily").setDescription("รับรางวัลรายวัน"),
  new SlashCommandBuilder().setName("profile").setDescription("ดูโปรไฟล์"),
  new SlashCommandBuilder().setName("leaderboard").setDescription("ดูอันดับ")
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


module.exports = { registerCommands }
