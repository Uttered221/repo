const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

const { db, saveDB } = require("./database");

/* =========================
   เริ่มเกม
========================= */

function startNumberGuess(roomId) {
  const room = db.rooms[roomId];
  if (!room) return;

  room.gameData = {
    target: Math.floor(Math.random() * 100) + 1,
    winner: null,
    votes: []
  };

  room.state = "playing";
  saveDB();
}

/* =========================
   Embed
========================= */

function buildNumberEmbed(room) {
  const data = room.gameData;

  if (data.winner) {
    return new EmbedBuilder()
      .setTitle("🏆 มีผู้ชนะแล้ว!")
      .setColor(0x00ff00)
      .setDescription(`🎉 ผู้ชนะคือ <@${data.winner}>`);
  }

  return new EmbedBuilder()
    .setTitle("🔢 NUMBER GUESS")
    .setColor(0x0099ff)
    .setDescription("ทายเลข 1 - 100 ใครทายถูกก่อนชนะ")
    .setFooter({
      text: `โหวตจบ: ${data.votes.length}/${room.players.length}`
    });
}

/* =========================
   ปุ่ม
========================= */

function buildNumberButtons(room) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`number_guess_${room.id}`)
      .setLabel("🔢 ทายเลข")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`number_vote_${room.id}`)
      .setLabel("🛑 โหวตจบ")
      .setStyle(ButtonStyle.Danger)
  );

  return [row];
}

/* =========================
   สร้าง Modal ให้กรอกเลข
========================= */

function buildGuessModal(roomId) {
  const modal = new ModalBuilder()
    .setCustomId(`number_modal_${roomId}`)
    .setTitle("ทายเลข 1-100");

  const input = new TextInputBuilder()
    .setCustomId("guess_input")
    .setLabel("กรอกตัวเลข")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const row = new ActionRowBuilder().addComponents(input);
  modal.addComponents(row);

  return modal;
}

/* =========================
   ตรวจคำตอบ
========================= */

function checkGuess(roomId, userId, guess) {
  const room = db.rooms[roomId];
  if (!room) return "invalid";

  const data = room.gameData;

  guess = parseInt(guess);
  if (isNaN(guess)) return "invalid";

  if (guess === data.target) {
    data.winner = userId;
    room.state = "ended";
    delete db.rooms[roomId];
    saveDB();
    return "correct";
  }

  if (guess > data.target) return "high";
  if (guess < data.target) return "low";
}

/* =========================
   โหวตจบ
========================= */

function voteEndNumber(roomId, userId) {
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
  startNumberGuess,
  buildNumberEmbed,
  buildNumberButtons,
  buildGuessModal,
  checkGuess,
  voteEndNumber
};
