const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { db, saveDB } = require("./database");

/* =========================
   เริ่ม Speed Game
========================= */

function startSpeed(roomId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const delay = Math.floor(Math.random() * 4000) + 3000; // 3-7 วิ

  room.gameData = {
    started: false,
    winner: null,
    votes: [],
    delay
  };

  room.state = "playing";
  saveDB();
}

/* =========================
   เปิด GO (เรียกจาก setTimeout ใน interaction)
========================= */

function triggerGo(roomId) {
  const room = db.rooms[roomId];
  if (!room) return;

  room.gameData.started = true;
  saveDB();
}

/* =========================
   Embed
========================= */

function buildSpeedEmbed(room) {
  const data = room.gameData;

  if (!data.started) {
    return new EmbedBuilder()
      .setTitle("⚡ SPEED CLICK")
      .setColor(0x00ffff)
      .setDescription("⏳ รอสัญญาณ...")
      .setFooter({
        text: `โหวตจบ: ${data.votes.length}/${room.players.length}`
      });
  }

  if (data.winner) {
    return new EmbedBuilder()
      .setTitle("🏆 มีผู้ชนะแล้ว!")
      .setColor(0x00ff00)
      .setDescription(`🎉 ผู้ชนะคือ <@${data.winner}>`);
  }

  return new EmbedBuilder()
    .setTitle("🔥 GO !!!")
    .setColor(0xff0000)
    .setDescription("กดปุ่มให้เร็วที่สุด!");
}

/* =========================
   ปุ่ม
========================= */

function buildSpeedButtons(room) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`speed_click_${room.id}`)
      .setLabel("🏆 กดเลย")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`speed_vote_${room.id}`)
      .setLabel("🛑 โหวตจบ")
      .setStyle(ButtonStyle.Secondary)
  );

  return [row];
}

/* =========================
   กดปุ่ม
========================= */

function click(roomId, userId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;

  // กดก่อน GO = แพ้ทันที
  if (!data.started) {
    data.winner = null;
    room.state = "ended";
    delete db.rooms[roomId];
    saveDB();
    return "too_early";
  }

  if (!data.winner) {
    data.winner = userId;
    room.state = "ended";
    delete db.rooms[roomId];
    saveDB();
    return "win";
  }
}

/* =========================
   โหวตจบ
========================= */

function voteEndSpeed(roomId, userId) {
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
  startSpeed,
  triggerGo,
  buildSpeedEmbed,
  buildSpeedButtons,
  click,
  voteEndSpeed
};
