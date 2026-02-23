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
   คำสุ่ม
========================= */

const words = [
  "DISCORD",
  "GAMING",
  "JAVASCRIPT",
  "HANGMAN",
  "BATTLE",
  "DRAGON",
  "SERVER",
  "BUTTON"
];

/* =========================
   เริ่มเกม
========================= */

function startHangman(roomId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const word = words[Math.floor(Math.random() * words.length)];

  room.gameData = {
    word,
    guessed: [],
    wrong: 0,
    maxWrong: 6,
    winner: null,
    votes: []
  };

  room.state = "playing";
  saveDB();
}

/* =========================
   แสดงคำ
========================= */

function getDisplayWord(data) {
  return data.word
    .split("")
    .map(letter =>
      data.guessed.includes(letter) ? letter : "_"
    )
    .join(" ");
}

/* =========================
   Embed
========================= */

function buildHangmanEmbed(room) {
  const data = room.gameData;

  if (data.winner) {
    return new EmbedBuilder()
      .setTitle("🏆 มีผู้ชนะแล้ว!")
      .setColor(0x00ff00)
      .setDescription(
        `🎉 <@${data.winner}> ทายคำถูก!\n\nคำคือ: **${data.word}**`
      );
  }

  if (data.wrong >= data.maxWrong) {
    return new EmbedBuilder()
      .setTitle("💀 เกมจบ!")
      .setColor(0xff0000)
      .setDescription(`คำคือ: **${data.word}**`);
  }

  return new EmbedBuilder()
    .setTitle("🧠 HANGMAN")
    .setColor(0x3399ff)
    .setDescription(
      `\n${getDisplayWord(data)}\n\n❌ ผิด: ${data.wrong}/${data.maxWrong}`
    )
    .setFooter({
      text: `โหวตจบ: ${data.votes.length}/${room.players.length}`
    });
}

/* =========================
   ปุ่ม
========================= */

function buildHangmanButtons(room) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`hangman_guess_${room.id}`)
      .setLabel("🔤 เดาตัวอักษร")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`hangman_vote_${room.id}`)
      .setLabel("🛑 โหวตจบ")
      .setStyle(ButtonStyle.Danger)
  );

  return [row];
}

/* =========================
   Modal
========================= */

function buildHangmanModal(roomId) {
  const modal = new ModalBuilder()
    .setCustomId(`hangman_modal_${roomId}`)
    .setTitle("เดาตัวอักษร");

  const input = new TextInputBuilder()
    .setCustomId("letter_input")
    .setLabel("กรอก 1 ตัวอักษร")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(1);

  const row = new ActionRowBuilder().addComponents(input);
  modal.addComponents(row);

  return modal;
}

/* =========================
   ตรวจคำตอบ
========================= */

function guessLetter(roomId, userId, letter) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;

  letter = letter.toUpperCase();

  if (data.guessed.includes(letter)) return;

  data.guessed.push(letter);

  if (!data.word.includes(letter)) {
    data.wrong++;
  }

  const allRevealed = data.word
    .split("")
    .every(l => data.guessed.includes(l));

  if (allRevealed) {
    data.winner = userId;
    room.state = "ended";
    delete db.rooms[roomId];
  }

  if (data.wrong >= data.maxWrong) {
    room.state = "ended";
    delete db.rooms[roomId];
  }

  saveDB();
}

/* =========================
   โหวตจบ
========================= */

function voteEndHangman(roomId, userId) {
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
  startHangman,
  buildHangmanEmbed,
  buildHangmanButtons,
  buildHangmanModal,
  guessLetter,
  voteEndHangman
};
