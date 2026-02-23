const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { db, saveDB } = require("./database");

function claimDaily(userId) {
  if (!db.users[userId]) {
    db.users[userId] = { money: 0, lastDaily: 0 };
  }

  const now = Date.now();
  const cooldown = 24 * 60 * 60 * 1000;

  if (now - db.users[userId].lastDaily < cooldown) {
    const remaining =
      cooldown - (now - db.users[userId].lastDaily);

    return { error: true, remaining };
  }

  const reward = 100 + Math.floor(Math.random() * 201);

  db.users[userId].money += reward;
  db.users[userId].lastDaily = now;

  saveDB();

  return { error: false, reward };
}

function buildDailyEmbed(result) {
  if (result.error) {
    return new EmbedBuilder()
      .setTitle("⏳ รับไปแล้ววันนี้")
      .setColor(0xffaa00)
      .setDescription("กลับมาพรุ่งนี้ใหม่");
  }

  return new EmbedBuilder()
    .setTitle("💰 รับเงินรายวันสำเร็จ")
    .setColor(0x00ff99)
    .setDescription(`คุณได้รับ **${result.reward} coins**`);
}

function buildDailyButton() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("daily_claim")
        .setLabel("💰 รับเงินรายวัน")
        .setStyle(ButtonStyle.Success)
    )
  ];
}

module.exports = {
  claimDaily,
  buildDailyEmbed,
  buildDailyButton
};
