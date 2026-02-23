const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { db, saveDB } = require("./database");

/* =========================
   เริ่ม Duel
========================= */

function startDuel(roomId) {
  const room = db.rooms[roomId];
  if (!room) return;
  if (room.players.length !== 2) return;

  room.gameData = {
    hp: {},
    turnIndex: 0,
    votes: []
  };

  for (const p of room.players) {
    room.gameData.hp[p] = 100;
  }

  room.state = "playing";
  saveDB();
}

/* =========================
   Embed Duel
========================= */

function buildDuelEmbed(room) {
  const data = room.gameData;
  const p1 = room.players[0];
  const p2 = room.players[1];
  const current = room.players[data.turnIndex];

  return new EmbedBuilder()
    .setTitle("⚔️ DUEL ARENA")
    .setColor(0x990000)
    .setDescription(
      `❤️ <@${p1}>: ${data.hp[p1]} HP\n` +
      `❤️ <@${p2}>: ${data.hp[p2]} HP\n\n` +
      `🎯 ถึงตา: <@${current}>`
    )
    .setFooter({ text: `โหวตจบ: ${data.votes.length}/2` });
}

/* =========================
   ปุ่ม Duel
========================= */

function buildDuelButtons(room, userId) {
  const data = room.gameData;
  const current = room.players[data.turnIndex];
  const isTurn = current === userId;

  const row = new ActionRowBuilder();

  if (isTurn) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`duel_attack_${room.id}`)
        .setLabel("⚔️ โจมตี")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId(`duel_defend_${room.id}`)
        .setLabel("🛡 ป้องกัน")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(`duel_skill_${room.id}`)
        .setLabel("💥 สกิลแรง")
        .setStyle(ButtonStyle.Primary)
    );
  }

  row.addComponents(
    new ButtonBuilder()
      .setCustomId(`duel_vote_${room.id}`)
      .setLabel("🛑 โหวตจบ")
      .setStyle(ButtonStyle.Secondary)
  );

  return [row];
}

/* =========================
   ระบบเทิร์น
========================= */

function nextTurn(room) {
  room.gameData.turnIndex =
    (room.gameData.turnIndex + 1) % room.players.length;
}

/* =========================
   โจมตีปกติ
========================= */

function attack(roomId, userId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;
  const current = room.players[data.turnIndex];
  if (current !== userId) return;

  const enemy = room.players.find(p => p !== userId);
  const dmg = Math.floor(Math.random() * 15) + 5;

  data.hp[enemy] -= dmg;

  checkWin(room);
  nextTurn(room);
  saveDB();
}

/* =========================
   ป้องกัน
========================= */

function defend(roomId, userId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;
  const current = room.players[data.turnIndex];
  if (current !== userId) return;

  data.hp[userId] += 5;

  nextTurn(room);
  saveDB();
}

/* =========================
   สกิลแรง
========================= */

function skill(roomId, userId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;
  const current = room.players[data.turnIndex];
  if (current !== userId) return;

  const enemy = room.players.find(p => p !== userId);
  const dmg = Math.floor(Math.random() * 25) + 10;

  data.hp[enemy] -= dmg;

  checkWin(room);
  nextTurn(room);
  saveDB();
}

/* =========================
   เช็คชนะ
========================= */

function checkWin(room) {
  const data = room.gameData;

  for (const p of room.players) {
    if (data.hp[p] <= 0) {
      room.state = "ended";
      delete db.rooms[room.id];
      break;
    }
  }
}

/* =========================
   โหวตจบ
========================= */

function voteEndDuel(roomId, userId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;

  if (!data.votes.includes(userId)) {
    data.votes.push(userId);
  }

  if (data.votes.length === 2) {
    room.state = "ended";
    delete db.rooms[roomId];
  }

  saveDB();
}

module.exports = {
  startDuel,
  buildDuelEmbed,
  buildDuelButtons,
  attack,
  defend,
  skill,
  voteEndDuel
};
