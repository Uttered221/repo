const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { db, saveDB } = require("./database");

/* =========================
   เริ่มเกม
========================= */

function startCoinFlip(roomId) {
  const room = db.rooms[roomId];
  if (!room) return;

  room.gameData = {
    choices: {}, // userId: "heads" | "tails"
    result: null,
    winners: [],
    votes: []
  };

  room.state = "playing";
  saveDB();
}

/* =========================
   Embed
========================= */

function buildCoinFlipEmbed(room) {
  const data = room.gameData;

  if (data.result) {
    return new EmbedBuilder()
      .setTitle("🪙 ผลออกแล้ว!")
      .setColor(0x00ff99)
      .setDescription(
        `เหรียญออก: **${data.result === "heads" ? "หัว" : "ก้อย"}**\n\n` +
        (data.winners.length > 0
          ? `🏆 ผู้ชนะ:\n${data.winners.map(id => `<@${id}>`).join("\n")}`
          : "ไม่มีใครทายถูก")
      );
  }

  return new EmbedBuilder()
    .setTitle("🪙 COIN FLIP BATTLE")
    .setColor(0x3399ff)
    .setDescription("เลือกหัวหรือก้อย แล้วรอผล")
    .setFooter({
      text: `โหวตจบ: ${data.votes.length}/${room.players.length}`
    });
}

/* =========================
   ปุ่ม
========================= */

function buildCoinFlipButtons(room) {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`coin_heads_${room.id}`)
      .setLabel("หัว")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`coin_tails_${room.id}`)
      .setLabel("ก้อย")
      .setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`coin_flip_${room.id}`)
      .setLabel("🎲 โยนเหรียญ")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`coin_vote_${room.id}`)
      .setLabel("🛑 โหวตจบ")
      .setStyle(ButtonStyle.Danger)
  );

  return [row1, row2];
}

/* =========================
   เลือกหัว/ก้อย
========================= */

function chooseSide(roomId, userId, side) {
  const room = db.rooms[roomId];
  if (!room) return;

  room.gameData.choices[userId] = side;
  saveDB();
}

/* =========================
   โยนเหรียญ
========================= */

function flipCoin(roomId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;

  const result = Math.random() < 0.5 ? "heads" : "tails";
  data.result = result;

  for (const userId in data.choices) {
    if (data.choices[userId] === result) {
      data.winners.push(userId);
    }
  }

  room.state = "ended";
  delete db.rooms[roomId];
  saveDB();
}

/* =========================
   โหวตจบ
========================= */

function voteEndCoin(roomId, userId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;

  if (!data.votes.includes(userId)) {
    data.votes.push(userId);
  }

  if (data.votes.length > room.players.length / 2) {
    room.state = "ended";
    delete db.rooms[roomId];
  }

  saveDB();
}

module.exports = {
  startCoinFlip,
  buildCoinFlipEmbed,
  buildCoinFlipButtons,
  chooseSide,
  flipCoin,
  voteEndCoin
};
