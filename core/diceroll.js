const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { db, saveDB } = require("./database");

/* =========================
   เริ่ม Dice Roll
========================= */

function startDice(roomId) {
  const room = db.rooms[roomId];
  if (!room) return;

  room.gameData = {
    rolls: {},     // userId: number
    finished: false,
    votes: []
  };

  room.state = "playing";
  saveDB();
}

/* =========================
   Embed
========================= */

function buildDiceEmbed(room) {
  const data = room.gameData;

  const status = room.players
    .map(p => {
      const roll = data.rolls[p];
      return `🎲 <@${p}>: ${roll ? roll : "ยังไม่ทอย"}`;
    })
    .join("\n");

  return new EmbedBuilder()
    .setTitle("🎲 DICE ROLL BATTLE")
    .setColor(0x9966ff)
    .setDescription(status)
    .setFooter({
      text: `โหวตจบ: ${data.votes.length}/${room.players.length}`
    });
}

/* =========================
   ปุ่ม
========================= */

function buildDiceButtons(room) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`dice_roll_${room.id}`)
      .setLabel("🎲 ทอยเต๋า")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`dice_vote_${room.id}`)
      .setLabel("🛑 โหวตจบ")
      .setStyle(ButtonStyle.Danger)
  );

  return [row];
}

/* =========================
   ทอยเต๋า
========================= */

function roll(roomId, userId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;

  if (data.rolls[userId]) return; // ทอยได้ครั้งเดียว

  const result = Math.floor(Math.random() * 6) + 1;
  data.rolls[userId] = result;

  checkFinish(room);
  saveDB();
}

/* =========================
   เช็คว่าทุกคนทอยครบ
========================= */

function checkFinish(room) {
  const data = room.gameData;

  const allRolled = room.players.every(
    p => data.rolls[p]
  );

  if (!allRolled) return;

  data.finished = true;

  // หาผู้ชนะ
  let highest = 0;
  let winner = null;

  for (const p of room.players) {
    if (data.rolls[p] > highest) {
      highest = data.rolls[p];
      winner = p;
    }
  }

  data.winner = winner;

  room.state = "ended";
  delete db.rooms[room.id];
}

/* =========================
   โหวตจบ
========================= */

function voteEndDice(roomId, userId) {
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
  startDice,
  buildDiceEmbed,
  buildDiceButtons,
  roll,
  voteEndDice
};
