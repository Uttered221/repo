const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { db, saveDB } = require("./database");

/* =========================
   คำถาม
========================= */

const questions = [
  {
    question: "เมืองหลวงของญี่ปุ่นคืออะไร?",
    options: ["โตเกียว", "โซล", "ปักกิ่ง", "ฮานอย"],
    answer: 0
  },
  {
    question: "2 + 5 = ?",
    options: ["5", "6", "7", "8"],
    answer: 2
  },
  {
    question: "ภาษา JS ย่อมาจากอะไร?",
    options: ["JavaSystem", "JavaScript", "JustScript", "JsonScript"],
    answer: 1
  }
];

/* =========================
   เริ่มเกม
========================= */

function startQuiz(roomId) {
  const room = db.rooms[roomId];
  if (!room) return;

  const q = questions[Math.floor(Math.random() * questions.length)];

  room.gameData = {
    question: q,
    answered: false,
    winner: null,
    votes: []
  };

  room.state = "playing";
  saveDB();
}

/* =========================
   Embed
========================= */

function buildQuizEmbed(room) {
  const data = room.gameData;
  const q = data.question;

  if (data.winner) {
    return new EmbedBuilder()
      .setTitle("🏆 มีผู้ชนะ!")
      .setColor(0x00ff00)
      .setDescription(
        `🎉 <@${data.winner}> ตอบถูก!\n\nคำตอบคือ: **${q.options[q.answer]}**`
      );
  }

  return new EmbedBuilder()
    .setTitle("🧠 QUIZ")
    .setColor(0x3399ff)
    .setDescription(
      `**${q.question}**\n\n` +
      q.options
        .map((opt, i) => `**${i + 1}.** ${opt}`)
        .join("\n")
    )
    .setFooter({
      text: `โหวตข้าม: ${data.votes.length}/${room.players.length}`
    });
}

/* =========================
   ปุ่ม
========================= */

function buildQuizButtons(room) {
  const q = room.gameData.question;

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`quiz_answer_${room.id}_0`)
      .setLabel("1")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`quiz_answer_${room.id}_1`)
      .setLabel("2")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`quiz_answer_${room.id}_2`)
      .setLabel("3")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`quiz_answer_${room.id}_3`)
      .setLabel("4")
      .setStyle(ButtonStyle.Primary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`quiz_vote_${room.id}`)
      .setLabel("⏭ โหวตข้าม")
      .setStyle(ButtonStyle.Danger)
  );

  return [row1, row2];
}

/* =========================
   ตรวจคำตอบ
========================= */

function answerQuiz(roomId, userId, index) {
  const room = db.rooms[roomId];
  if (!room) return;

  const data = room.gameData;

  if (data.answered) return;

  if (index === data.question.answer) {
    data.winner = userId;
    data.answered = true;
    room.state = "ended";
    delete db.rooms[roomId];
  }

  saveDB();
}

/* =========================
   โหวตข้าม
========================= */

function voteSkipQuiz(roomId, userId) {
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
  startQuiz,
  buildQuizEmbed,
  buildQuizButtons,
  answerQuiz,
  voteSkipQuiz
};
