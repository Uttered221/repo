const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { db, saveDB } = require("./database");

/* =========================
   เริ่ม Boss Raid
========================= */

function startBoss(roomId) {
  const room = db.rooms[roomId];
  if (!room) return;

  room.gameData = {
    bossHP: 500,
    bossMaxHP: 500,
    playersHP: {},
    votes: []
  };

  for (const p of room.players) {
    room.gameData.playersHP[p] = 100;
  }

  room.state = "playing";
  saveDB();
}

/* =========================
   Embed Boss
========================= */

function buildBossEmbed(room) {
  const data = room.gameData;

  const playerStatus = room.players
    .map(p => `❤️ <@${p}>: ${data.playersHP[p]} HP`)
    .join("\n");

  return new EmbedBuilder()
    .setTitle("🐲 WORLD BOSS RAID")
    .setColor(0x550000)
    .setDescription(
      `🩸 บอส HP: ${data.bossHP}/${data.bossMaxHP}\n\n` +
      `👥 ผู้เล่น:\n${playerStatus}`
    )
    .setFooter({ text: `โหวตจบ: ${data.votes.length}/${room.players.length}` });
}

/* =========================
   ปุ่ม Boss
========================= */

function buildBossButtons(room) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`boss_attack_${room.id}`)
      .setLabel("⚔️ โจมตี")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId(`boss_skill_${room.id}`)
      .setLabel("💥 สกิลแรง")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`boss_heal_${room.id}`)
      .setLabel("💚 ฮีล")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId(`boss_vote_${room.id}`)
      .setLabel("🛑 โหวตจบ")
      .setStyle(ButtonStyle.Secondary)
  );

  return [row];
}

/* =========================
   โจมตีบอส
========================= */

function attack(roomId, userId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;
  if (data.playersHP[userId] <= 0) return;

  const dmg = Math.floor(Math.random() * 20) + 10;
  data.bossHP -= dmg;

  bossCounterAttack(room);
  checkBossWin(room);
  saveDB();
}

/* =========================
   สกิลแรง
========================= */

function skill(roomId, userId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;
  if (data.playersHP[userId] <= 0) return;

  const dmg = Math.floor(Math.random() * 35) + 20;
  data.bossHP -= dmg;

  bossCounterAttack(room);
  checkBossWin(room);
  saveDB();
}

/* =========================
   ฮีล
========================= */

function heal(roomId, userId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;
  if (data.playersHP[userId] <= 0) return;

  data.playersHP[userId] += 15;
  if (data.playersHP[userId] > 100)
    data.playersHP[userId] = 100;

  bossCounterAttack(room);
  saveDB();
}

/* =========================
   บอสสวนกลับ
========================= */

function bossCounterAttack(room) {
  const data = room.gameData;

  const alivePlayers = room.players.filter(
    p => data.playersHP[p] > 0
  );

  if (alivePlayers.length === 0) return;

  const target =
    alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

  const dmg = Math.floor(Math.random() * 20) + 5;
  data.playersHP[target] -= dmg;
}

/* =========================
   เช็คจบเกม
========================= */

function checkBossWin(room) {
  const data = room.gameData;

  if (data.bossHP <= 0) {
    room.state = "ended";
    delete db.rooms[room.id];
    return;
  }

  const alive = room.players.some(
    p => data.playersHP[p] > 0
  );

  if (!alive) {
    room.state = "ended";
    delete db.rooms[room.id];
  }
}

/* =========================
   โหวตจบ
========================= */

function voteEndBoss(roomId, userId) {
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
  startBoss,
  buildBossEmbed,
  buildBossButtons,
  attack,
  skill,
  heal,
  voteEndBoss
};
