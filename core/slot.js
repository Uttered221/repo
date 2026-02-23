const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { db, saveDB } = require("./database");

/* =========================
   เริ่ม Slot Room
========================= */

function startSlot(roomId) {
  const room = db.rooms[roomId];
  if (!room) return;

  room.gameData = {
    lastSpin: ["❔", "❔", "❔"],
    votes: []
  };

  room.state = "playing";
  saveDB();
}

/* =========================
   สุ่มสล็อต
========================= */

function spinReels() {
  const symbols = ["🍒", "🍋", "⭐", "🔔", "💎"];
  return [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];
}

/* =========================
   คำนวณรางวัล
========================= */

function calculateReward(reels) {
  if (reels[0] === reels[1] && reels[1] === reels[2]) {
    return 100; // ตรง 3 ตัว
  }

  if (reels[0] === reels[1] || reels[1] === reels[2]) {
    return 25; // ตรง 2 ตัว
  }

  return 0;
}

/* =========================
   Embed Slot
========================= */

function buildSlotEmbed(room) {
  const data = room.gameData;

  return new EmbedBuilder()
    .setTitle("🎰 SLOT MACHINE")
    .setColor(0xffd700)
    .setDescription(
      `\n${data.lastSpin[0]} | ${data.lastSpin[1]} | ${data.lastSpin[2]}\n\n` +
      `กดหมุนเพื่อลุ้นรางวัล`
    )
    .setFooter({ text: `โหวตจบ: ${data.votes.length}/${room.players.length}` });
}

/* =========================
   ปุ่ม Slot
========================= */

function buildSlotButtons(room) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`slot_spin_${room.id}`)
      .setLabel("🎰 หมุน")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`slot_vote_${room.id}`)
      .setLabel("🛑 โหวตจบ")
      .setStyle(ButtonStyle.Danger)
  );

  return [row];
}

/* =========================
   กดหมุน
========================= */

function spin(roomId, userId) {
  const room = db.rooms[roomId];
  if (!room) return 0;

  const data = room.gameData;

  const reels = spinReels();
  data.lastSpin = reels;

  const reward = calculateReward(reels);

  saveDB();
  return reward; // เอาไปเพิ่ม coin ให้ user เอง
}

/* =========================
   โหวตจบ
========================= */

function voteEndSlot(roomId, userId) {
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
  startSlot,
  buildSlotEmbed,
  buildSlotButtons,
  spin,
  voteEndSlot
};
