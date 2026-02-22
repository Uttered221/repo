const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder
} = require('discord.js');

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const leaderboard = new Map();

// =====================
// ฟังก์ชันคะแนน
// =====================
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

// =====================
// Slash Commands
// =====================
const commands = [

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('เช็คบอท'),

  new SlashCommandBuilder()
    .setName('dice')
    .setDescription('ทอยลูกเต๋า'),

  new SlashCommandBuilder()
    .setName('flip')
    .setDescription('โยนเหรียญ'),

  new SlashCommandBuilder()
    .setName('rps')
    .setDescription('เป่ายิ้งฉุบ')
    .addStringOption(option =>
      option.setName('choice')
        .setDescription('rock / paper / scissors')
        .setRequired(true)
        .addChoices(
          { name: 'rock', value: 'rock' },
          { name: 'paper', value: 'paper' },
          { name: 'scissors', value: 'scissors' }
        )
    ),

  new SlashCommandBuilder()
    .setName('profile')
    .setDescription('ดูสถิติ'),

  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('ดูอันดับคะแนน')

].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log('Slash Commands พร้อมใช้');
  } catch (err) {
    console.error(err);
  }
})();

// =====================
// บอทออนไลน์
// =====================
client.once('ready', () => {
  console.log(`Bot online: ${client.user.tag}`);
});

// =====================
// รับคำสั่ง
// =====================
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const userId = interaction.user.id;

  if (interaction.commandName === 'ping') {
    return interaction.reply('🏓 Pong!');
  }

  if (interaction.commandName === 'dice') {
    const roll = Math.floor(Math.random() * 6) + 1;
    return interaction.reply(`🎲 ได้ ${roll}`);
  }

  if (interaction.commandName === 'flip') {
    const result = Math.random() < 0.5 ? 'หัว 🪙' : 'ก้อย 🪙';
    return interaction.reply(result);
  }

  if (interaction.commandName === 'rps') {
    const player = interaction.options.getString('choice');
    const choices = ['rock', 'paper', 'scissors'];
    const bot = choices[Math.floor(Math.random() * 3)];

    if (player === bot) {
      return interaction.reply(`เสมอ 🤝 (${bot})`);
    }

    if (
      (player === 'rock' && bot === 'scissors') ||
      (player === 'paper' && bot === 'rock') ||
      (player === 'scissors' && bot === 'paper')
    ) {
      addPoints(userId, 15);
      return interaction.reply(`ชนะ 🎉 (${bot}) +15 คะแนน`);
    } else {
      addLoss(userId);
      return interaction.reply(`แพ้ ☠️ (${bot})`);
    }
  }

  if (interaction.commandName === 'profile') {
    const stats = leaderboard.get(userId) || { wins: 0, losses: 0, points: 0 };

    const embed = new EmbedBuilder()
      .setColor('#2ECC71')
      .setTitle(`📊 ${interaction.user.username}`)
      .addFields(
        { name: '🏆 ชนะ', value: `${stats.wins}`, inline: true },
        { name: '💔 แพ้', value: `${stats.losses}`, inline: true },
        { name: '⭐ คะแนน', value: `${stats.points}`, inline: true }
      );

    return interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'leaderboard') {
    const sorted = [...leaderboard.entries()]
      .sort((a, b) => b[1].points - a[1].points)
      .slice(0, 10);

    if (sorted.length === 0) {
      return interaction.reply('ยังไม่มีใครเล่น');
    }

    let text = '';
    sorted.forEach((entry, index) => {
      text += `${index + 1}. <@${entry[0]}> - ${entry[1].points} ⭐\n`;
    });

    return interaction.reply(text);
  }
});

client.login(TOKEN);
