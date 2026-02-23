const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { db, saveDB } = require("./database");

function startSpeedUno(roomId) {
  const room = db.rooms[roomId];
  if (!room) return;

  room.gameData = {
    cards: {},
    winner: null
  };

  room.players.forEach(id => {
    room.gameData.cards[id] = 5;
  });

  room.state = "playing";
  saveDB();
}

function playCard(roomId, userId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;

  if (!data.cards[userId]) return;

  data.cards[userId]--;

  if (data.cards[userId] <= 0) {
    data.winner = userId;
    room.state = "ended";
    delete db.rooms[roomId];
  }

  saveDB();
}

function buildSpeedUnoEmbed(room) {
  const data = room.gameData;

  if (data.winner) {
    return new EmbedBuilder()
      .setTitle("🏆 SPEED UNO ผู้ชนะ")
      .setColor(0x00ff00)
      .setDescription(`<@${data.winner}> การ์ดหมดก่อน!`);
  }

  return new EmbedBuilder()
    .setTitle("⚡ SPEED UNO")
    .setColor(0x3399ff)
    .setDescription(
      Object.entries(data.cards)
        .map(([id, count]) => `<@${id}> : ${count} ใบ`)
        .join("\n")
    );
}

function buildSpeedUnoButtons(room) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`speeduno_play_${room.id}`)
        .setLabel("🃏 ลงการ์ด")
        .setStyle(ButtonStyle.Primary)
    )
  ];
}

module.exports = {
  startSpeedUno,
  playCard,
  buildSpeedUnoEmbed,
  buildSpeedUnoButtons
};
