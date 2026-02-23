const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { db, saveDB } = require("./database");

/* =========================
   สร้างสำรับไพ่ UNO
========================= */

function createDeck() {
  const colors = ["🔴", "🟢", "🔵", "🟡"];
  const deck = [];

  for (const color of colors) {
    for (let i = 0; i <= 9; i++) {
      deck.push({ color, value: i });
    }
  }

  return shuffle(deck);
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

/* =========================
   เริ่มเกม UNO
========================= */

function startUNO(roomId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const deck = createDeck();
  const players = room.players;

  room.gameData = {
    deck,
    discard: [deck.pop()],
    hands: {},
    turnIndex: 0,
    direction: 1,
    votes: []
  };

  for (const p of players) {
    room.gameData.hands[p] = deck.splice(0, 5);
  }

  room.state = "playing";
  saveDB();
}

/* =========================
   Embed ห้อง UNO
========================= */

function buildUNOEmbed(room) {
  const data = room.gameData;
  const currentPlayer = room.players[data.turnIndex];

  return new EmbedBuilder()
    .setTitle("🃏 UNO ROOM")
    .setColor(0xff0000)
    .setDescription(
      `ไพ่กลาง: ${data.discard[data.discard.length - 1].color} ${data.discard[data.discard.length - 1].value}\n\n` +
      `ถึงตา: <@${currentPlayer}>\n\n` +
      room.players
        .map(p => `👤 <@${p}> (${data.hands[p].length} ใบ)`)
        .join("\n")
    )
    .setFooter({ text: `โหวตจบ: ${data.votes.length}/${room.players.length}` });
}

/* =========================
   ปุ่ม UNO
========================= */

function buildUNOButtons(room, userId) {
  const data = room.gameData;
  const currentPlayer = room.players[data.turnIndex];
  const isTurn = currentPlayer === userId;

  const row = new ActionRowBuilder();

  if (isTurn) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`uno_play_${room.id}`)
        .setLabel("🃏 เล่นไพ่")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId(`uno_draw_${room.id}`)
        .setLabel("📥 จั่ว")
        .setStyle(ButtonStyle.Secondary)
    );
  }

  row.addComponents(
    new ButtonBuilder()
      .setCustomId(`uno_vote_${room.id}`)
      .setLabel("🛑 โหวตจบ")
      .setStyle(ButtonStyle.Danger)
  );

  return [row];
}

/* =========================
   เล่นไพ่ (ง่ายสุด: เล่นใบแรกที่ตรงสี/เลข)
========================= */

function playCard(roomId, userId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;
  const hand = data.hands[userId];
  const top = data.discard[data.discard.length - 1];

  const playable = hand.find(
    c => c.color === top.color || c.value === top.value
  );

  if (!playable) return false;

  data.discard.push(playable);
  data.hands[userId] = hand.filter(c => c !== playable);

  nextTurn(room);
  saveDB();
  return true;
}

/* =========================
   จั่วไพ่
========================= */

function drawCard(roomId, userId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;

  if (data.deck.length === 0) return;

  const card = data.deck.pop();
  data.hands[userId].push(card);

  nextTurn(room);
  saveDB();
}

/* =========================
   เปลี่ยนเทิร์น
========================= */

function nextTurn(room) {
  const data = room.gameData;

  data.turnIndex =
    (data.turnIndex + data.direction + room.players.length) %
    room.players.length;
}

/* =========================
   โหวตจบเกม
========================= */

function voteEndUNO(roomId, userId) {
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
  startUNO,
  buildUNOEmbed,
  buildUNOButtons,
  playCard,
  drawCard,
  voteEndUNO
};
