// ===============================
// DISCORD BOT - COMPLETE GAMING SYSTEM
// ===============================

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;

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
// WELCOME MESSAGE
// ===============================
client.on('guildMemberAdd', (member) => {
  const welcomeEmbed = new EmbedBuilder()
    .setColor('#7B68EE')
    .setTitle('🎉 ยินดีต้อนรับ!')
    .setDescription(`สวัสดี ${member.user.username}!`)
    .addFields(
      { name: '🎮 เกมที่มี', value: 'UNO • Trivia • RPS • Dice • Flip • Hangman' },
      { name: '📖 เริ่มต้น', value: 'พิมพ์ `!help` เพื่อดูคำสั่งทั้งหมด' }
    )
    .setThumbnail(member.user.displayAvatarURL());

  member.send({ embeds: [welcomeEmbed] }).catch(() => {
    member.guild.systemChannel?.send({ embeds: [welcomeEmbed] });
  });
});

// ===============================
// COMMAND HANDLER
// ===============================
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).split(/ +/);
  const command = args[0].toLowerCase();

  if (command === 'help') {
    const embed = new EmbedBuilder()
      .setColor('#7B68EE')
      .setTitle('📚 คำสั่งทั้งหมด')
      .setDescription(`
🎴 !uno
🧠 !trivia
🪨 !rps rock/paper/scissors
🎲 !dice
🪙 !flip
📊 !profile
🏆 !leaderboard
😂 !joke
🏓 !ping
`);
    return message.reply({ embeds: [embed] });
  }

  // TRIVIA
  if (command === 'trivia') {
    const questions = [
      { q: '2 + 2 เท่ากับ?', a: ['4'] },
      { q: 'เมืองหลวงของไทย?', a: ['กรุงเทพ', 'bangkok'] },
      { q: 'ดาวเคราะห์ที่ใหญ่ที่สุด?', a: ['jupiter'] }
    ];

    const question = questions[Math.floor(Math.random() * questions.length)];

    const embed = new EmbedBuilder()
      .setColor('#FF6B9D')
      .setTitle('🧠 Trivia')
      .setDescription(question.q)
      .setFooter({ text: 'ตอบด้วย !answer [คำตอบ]' });

    const sent = await message.reply({ embeds: [embed] });
    gameRooms.set(`trivia_${sent.id}`, question);
  }

  if (command === 'answer' && args[1]) {
    const messages = await message.channel.messages.fetch({ limit: 10 });
    const triviaMsg = messages.find(m => m.author.bot);

    if (!triviaMsg) return;

    const question = gameRooms.get(`trivia_${triviaMsg.id}`);
    if (!question) return;

    const answer = args.slice(1).join(' ').toLowerCase();
    const correct = question.a.some(a => answer.includes(a));

    if (correct) {
      addPoints(message.author.id, 25);
      message.reply('✅ ถูกต้อง! +25 คะแนน');
      gameRooms.delete(`trivia_${triviaMsg.id}`);
    } else {
      message.reply('❌ ผิด ลองใหม่');
    }
  }

  // RPS
  if (command === 'rps') {
    const choices = ['rock', 'paper', 'scissors'];
    const bot = choices[Math.floor(Math.random() * 3)];

    if (!args[1]) {
      return message.reply('ใช้ !rps rock/paper/scissors');
    }

    const player = args[1].toLowerCase();
    if (!choices.includes(player)) {
      return message.reply('เลือก rock, paper หรือ scissors');
    }

    if (player === bot) {
      return message.reply(`เสมอ 🤝 (${bot})`);
    }

    if (
      (player === 'rock' && bot === 'scissors') ||
      (player === 'paper' && bot === 'rock') ||
      (player === 'scissors' && bot === 'paper')
    ) {
      addPoints(message.author.id, 15);
      return message.reply(`ชนะ 🎉 (${bot}) +15 คะแนน`);
    } else {
      addLoss(message.author.id);
      return message.reply(`แพ้ ☠️ (${bot})`);
    }
  }

  if (command === 'dice') {
    const roll = Math.floor(Math.random() * 6) + 1;
    message.reply(`🎲 ได้ ${roll}`);
  }

  if (command === 'flip') {
    const result = Math.random() < 0.5 ? 'หัว 🪙' : 'ก้อย 🪙';
    message.reply(result);
  }

  if (command === 'profile') {
    const stats = leaderboard.get(message.author.id) || { wins: 0, losses: 0, points: 0 };

    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle(`📊 ${message.author.username}`)
      .addFields(
        { name: '🏆 ชนะ', value: `${stats.wins}`, inline: true },
        { name: '💔 แพ้', value: `${stats.losses}`, inline: true },
        { name: '⭐ คะแนน', value: `${stats.points}`, inline: true }
      );

    message.reply({ embeds: [embed] });
  }

  if (command === 'leaderboard') {
    const sorted = [...leaderboard.entries()]
      .sort((a, b) => b[1].points - a[1].points)
      .slice(0, 10);

    if (sorted.length === 0) return message.reply('ยังไม่มีใครเล่นเกม');

    let text = '';
    sorted.forEach((entry, index) => {
      text += `${index + 1}. <@${entry[0]}> - ${entry[1].points} ⭐\n`;
    });

    message.reply(text);
  }

  if (command === 'joke') {
    const jokes = [
      'บอทก็อยากมีวันหยุดนะ 😂',
      'เล่นเกมเยอะ ๆ จะได้ขึ้นลีดเดอร์บอร์ด 😎',
      'แพ้ไม่เป็นไร ชนะครั้งหน้าก็ได้ 😆'
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    message.reply(joke);
  }

  if (command === 'ping') {
    const ping = Date.now() - message.createdTimestamp;
    message.reply(`🏓 Pong ${ping}ms`);
  }
});

client.once('ready', () => {
  console.log(`Bot online: ${client.user.tag}`);
  client.user.setActivity('!help | Gaming Mode');
});

client.login(TOKEN);
