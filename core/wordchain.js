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

function startWordChain(roomId) {
  const room = db.rooms[roomId];
  if (!room) return;

  room.gameData = {
    words: [],
    used: [],
    currentLetter: null,
    loser: null,
    votes: []
  };

  room.state = "playing";
  saveDB();
}

/* =========================
   Embed
========================= */

function buildWordChainEmbed(room) {
  const data = room.gameData;

  if (data.loser) {
    return new EmbedBuilder()
      .setTitle("💀 มีคนพลาด!")
      .setColor(0xff0000)
      .setDescription(
        `<@${data.loser}> ต่อคำผิด!\n\nคำล่าสุด: **${data.words[data.words.length - 1] || "-"}**`
      );
  }

  return new EmbedBuilder()
    .setTitle("🔤 WORD CHAIN")
    .setColor(0x33cc99)
    .setDescription(
      `คำล่าสุด: **${data.words[data.words.length - 1] || "-"}**\n` +
      `ต้องขึ้นต้นด้วย: **${data.currentLetter || "-"}**`
    )
    .setFooter({
      text: `โหวตจบ: ${data.votes.length}/${room.players.length}`
    });
}

/* =========================
   ปุ่ม
========================= */

function buildWordChainButtons(room) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`wordchain_input_${room.id}`)
      .setLabel("✍️ พิมพ์คำ")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`wordchain_vote_${room.id}`)
      .setLabel("🛑 โหวตจบ")
      .setStyle(ButtonStyle.Danger)
  );

  return [row];
}

/* =========================
   Modal
========================= */

function buildWordChainModal(roomId) {
  const modal = new ModalBuilder()
    .setCustomId(`wordchain_modal_${roomId}`)
    .setTitle("พิมพ์คำต่อ");

  const input = new TextInputBuilder()
    .setCustomId("word_input")
    .setLabel("กรอกคำ")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const row = new ActionRowBuilder().addComponents(input);
  modal.addComponents(row);

  return modal;
}

/* =========================
   ตรวจคำ
========================= */

function submitWord(roomId, userId, word) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;
  word = word.trim().toLowerCase();

  if (data.used.includes(word)) {
    data.loser = userId;
    room.state = "ended";
    delete db.rooms[roomId];
    saveDB();
    return;
  }

  if (data.currentLetter) {
    if (!word.startsWith(data.currentLetter)) {
      data.loser = userId;
      room.state = "ended";
      delete db.rooms[roomId];
      saveDB();
      return;
    }
  }

  data.words.push(word);
  data.used.push(word);
  data.currentLetter = word[word.length - 1];

  saveDB();
}

/* =========================
   โหวตจบ
========================= */

function voteEndWordChain(roomId, userId) {
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
  startWordChain,
  buildWordChainEmbed,
  buildWordChainButtons,
  buildWordChainModal,
  submitWord,
  voteEndWordChain
};
