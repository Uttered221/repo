// ===============================
// DISCORD BOT - COMPLETE GAMING SYSTEM + UNO
// ===============================

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const express = require("express");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const gameRooms = new Map();
const leaderboard = new Map();

// ===============================
// POINT SYSTEM
// ===============================
function addPoints(userId, points) {
  if (!leaderboard.has(userId)) {
    leaderboard.set(userId, { wins: 0, losses: 0, points: 0 });
  }
  const stats = leaderboard.get(userId);
  stats.points += points;
  stats.wins += 1;
}

function addLoss(userId) {
  if (!leaderboard.has(userId)) {
    leaderboard.set(userId, { wins: 0, losses: 0, points: 0 });
  }
  leaderboard.get(userId).losses += 1;
}

// ===============================
// MESSAGE HANDLER
// ===============================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!")) return;

  const args = message.content.slice(1).split(/ +/);
  const command = args[0].toLowerCase();

  // HELP
  if (command === "help") {
    return message.reply(
      "🎴 !uno  🧠 !trivia  🪨 !rps  🎲 !dice  🪙 !flip  📊 !profile  🏆 !leaderboard  😂 !joke  🏓 !ping"
    );
  }

  // ===============================
  // UNO (2 Players Simple)
  // ===============================
  if (command === "uno") {
    if (gameRooms.has(message.channel.id))
      return message.reply("มีเกมกำลังเล่นอยู่แล้ว");

    const colors = ["แดง", "น้ำเงิน", "เขียว", "เหลือง"];
    const deck = [];

    for (let color of colors) {
      for (let i = 0; i <= 9; i++) {
        deck.push(`${color} ${i}`);
      }
    }

    deck.sort(() => Math.random() - 0.5);

    gameRooms.set(message.channel.id, {
      deck,
      players: [message.author.id],
      hands: {},
      turn: 0,
      currentCard: deck.pop(),
    });

    return message.reply("🎴 UNO เริ่มแล้ว! อีกคนพิมพ์ !join");
  }

  if (command === "join") {
    const game = gameRooms.get(message.channel.id);
    if (!game) return;
    if (game.players.length >= 2)
      return message.reply("ผู้เล่นครบแล้ว");

    game.players.push(message.author.id);

    game.players.forEach((p) => {
      game.hands[p] = [];
      for (let i = 0; i < 5; i++) {
        game.hands[p].push(game.deck.pop());
      }
    });

    return message.channel.send(
      `🔥 เริ่มเกม!\nไพ่เริ่มต้น: ${game.currentCard}\nถึงตา <@${game.players[0]}>`
    );
  }

  if (command === "hand") {
    const game = gameRooms.get(message.channel.id);
    if (!game) return;
    if (!game.hands[message.author.id])
      return message.reply("คุณไม่ได้อยู่ในเกม");

    return message.author.send(
      "🃏 ไพ่ของคุณ:\n" + game.hands[message.author.id].join("\n")
    );
  }

  if (command === "play") {
    const game = gameRooms.get(message.channel.id);
    if (!game) return;

    const playerIndex = game.players.indexOf(message.author.id);
    if (playerIndex !== game.turn)
      return message.reply("ยังไม่ถึงตาคุณ");

    const card = args.slice(1).join(" ");
    const hand = game.hands[message.author.id];

    if (!hand.includes(card))
      return message.reply("คุณไม่มีไพ่ใบนั้น");

    const [color, number] = card.split(" ");
    const [curColor, curNumber] = game.currentCard.split(" ");

    if (color !== curColor && number !== curNumber)
      return message.reply("ลงไม่ได้ สีหรือเลขไม่ตรง");

    game.currentCard = card;
    game.hands[message.author.id] = hand.filter((c) => c !== card);

    if (game.hands[message.author.id].length === 0) {
      message.channel.send(`🏆 <@${message.author.id}> ชนะแล้ว!`);
      gameRooms.delete(message.channel.id);
      return;
    }

    game.turn = game.turn === 0 ? 1 : 0;

    return message.channel.send(
      `ลง ${card}\nไพ่ปัจจุบัน: ${game.currentCard}\nถึงตา <@${game.players[game.turn]}>`
    );
  }

  // ===============================
  // TRIVIA
  // ===============================
  if (command === "trivia") {
    const questions = [
      { q: "2 + 2 เท่ากับ?", a: ["4"] },
      { q: "เมืองหลวงของไทย?", a: ["กรุงเทพ", "bangkok"] },
    ];

    const q = questions[Math.floor(Math.random() * questions.length)];
    gameRooms.set(`trivia_${message.channel.id}`, q);

    return message.reply(
      `🧠 ${q.q}\nตอบด้วย !answer คำตอบ`
    );
  }

  if (command === "answer") {
    const q = gameRooms.get(`trivia_${message.channel.id}`);
    if (!q) return;

    const ans = args.slice(1).join(" ").toLowerCase();
    const correct = q.a.some((a) => ans.includes(a));

    if (correct) {
      addPoints(message.author.id, 25);
      gameRooms.delete(`trivia_${message.channel.id}`);
      return message.reply("✅ ถูกต้อง +25 คะแนน");
    } else {
      return message.reply("❌ ผิด");
    }
  }

  // RPS
  if (command === "rps") {
    const choices = ["rock", "paper", "scissors"];
    const bot = choices[Math.floor(Math.random() * 3)];
    const player = args[1];

    if (!choices.includes(player))
      return message.reply("ใช้ !rps rock/paper/scissors");

    if (player === bot) return message.reply("เสมอ 🤝");

    if (
      (player === "rock" && bot === "scissors") ||
      (player === "paper" && bot === "rock") ||
      (player === "scissors" && bot === "paper")
    ) {
      addPoints(message.author.id, 10);
      return message.reply("ชนะ 🎉");
    } else {
      addLoss(message.author.id);
      return message.reply("แพ้ ☠️");
    }
  }

  if (command === "dice")
    return message.reply(`🎲 ได้ ${Math.floor(Math.random() * 6) + 1}`);

  if (command === "flip")
    return message.reply(Math.random() < 0.5 ? "หัว 🪙" : "ก้อย 🪙");

  if (command === "profile") {
    const stats =
      leaderboard.get(message.author.id) || { wins: 0, losses: 0, points: 0 };

    return message.reply(
      `🏆 ชนะ: ${stats.wins}\n💔 แพ้: ${stats.losses}\n⭐ คะแนน: ${stats.points}`
    );
  }

  if (command === "leaderboard") {
    const sorted = [...leaderboard.entries()]
      .sort((a, b) => b[1].points - a[1].points)
      .slice(0, 5);

    if (!sorted.length) return message.reply("ยังไม่มีข้อมูล");

    let text = "🏆 Leaderboard\n";
    sorted.forEach((u, i) => {
      text += `${i + 1}. <@${u[0]}> - ${u[1].points}⭐\n`;
    });

    return message.reply(text);
  }

  if (command === "joke")
    return message.reply("😂 เล่นเยอะ ๆ จะเก่งเอง");

  if (command === "ping")
    return message.reply(
      `🏓 Pong ${Date.now() - message.createdTimestamp}ms`
    );
});

// ===============================
// READY
// ===============================
client.once("ready", () => {
  console.log(`Bot online: ${client.user.tag}`);
});

// ===============================
// EXPRESS (กันโดน kill บน Render)
// ===============================
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Web server started on port " + PORT);
});

// ===============================
client.login(process.env.TOKEN);
