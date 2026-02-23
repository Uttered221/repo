const {
  EmbedBuilder
} = require("discord.js");

const { getProfile } = require("./economy");

function buildProfileEmbed(userId) {
  const user = getProfile(userId);

  return new EmbedBuilder()
    .setTitle("👤 โปรไฟล์ผู้เล่น")
    .setColor(0x00ccff)
    .setDescription(
      `💰 เงิน: ${user.money}\n` +
      `⭐ เลเวล: ${user.level}\n` +
      `📊 XP: ${user.xp}`
    );
}

module.exports = {
  buildProfileEmbed
};
