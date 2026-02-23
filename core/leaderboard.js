const {
  EmbedBuilder
} = require("discord.js");

const { getLeaderboard } = require("./economy");

function buildLeaderboardEmbed() {
  const top = getLeaderboard();

  return new EmbedBuilder()
    .setTitle("🏆 Leaderboard เงิน")
    .setColor(0xffcc00)
    .setDescription(
      top
        .map(
          ([id, data], i) =>
            `#${i + 1} <@${id}> - ${data.money} coins`
        )
        .join("\n")
    );
}

module.exports = {
  buildLeaderboardEmbed
};
