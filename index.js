// ==========================================
// FULL GAME CENTER BOT (UI + ECONOMY + SHOP)
// ==========================================

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
  REST,
  Routes,
} = require("discord.js");

const fs = require("fs");
const express = require("express");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ================= DATABASE =================

const DATA_FILE = "./users.json";

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({}));
}

function loadUsers() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveUsers(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function getUser(userId) {
  const users = loadUsers();
  if (!users[userId]) {
    users[userId] = {
      coins: 0,
      xp: 0,
      level: 1,
      wins: 0,
      losses: 0,
      items: [],
    };
    saveUsers(users);
  }
  return users[userId];
}

function updateUser(userId, data) {
  const users = loadUsers();
  users[userId] = data;
  saveUsers(users);
}

// ================= LEVEL SYSTEM =================

function addXP(userId, amount) {
  const user = getUser(userId);
  user.xp += amount;

  const needed = user.level * 100;
  if (user.xp >= needed) {
    user.xp = 0;
    user.level += 1;
    user.coins += 100;
  }

  updateUser(userId, user);
}

// ================= SLASH COMMAND DEPLOY =================

const commands = [
  new SlashCommandBuilder()
    .setName("menu")
    .setDescription("เปิดเมนูเกมทั้งหมด"),
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commands,
    });
    console.log("Slash commands registered");
  } catch (error) {
    console.error(error);
  }
})();

// ================= INTERACTION =================

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === "menu") {
      const embed = new EmbedBuilder()
        .setTitle("🎮 GAME CENTER")
        .setDescription("เลือกเกมหรือระบบที่ต้องการ");

      const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("rps")
          .setLabel("🪨 RPS")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("profile")
          .setLabel("📊 โปรไฟล์")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("leaderboard")
          .setLabel("🏆 แรงค์")
          .setStyle(ButtonStyle.Secondary)
      );

      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("shop")
          .setLabel("🛒 ร้านค้า")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("daily")
          .setLabel("🎁 Daily")
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({
        embeds: [embed],
        components: [row1, row2],
      });
    }
  }

  if (interaction.isButton()) {
    const userId = interaction.user.id;

    // ================= RPS =================
    if (interaction.customId === "rps") {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("rock")
          .setLabel("Rock")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("paper")
          .setLabel("Paper")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("scissors")
          .setLabel("Scissors")
          .setStyle(ButtonStyle.Danger)
      );

      return interaction.reply({
        content: "เลือกของคุณ",
        components: [row],
        ephemeral: true,
      });
    }

    if (["rock", "paper", "scissors"].includes(interaction.customId)) {
      const choices = ["rock", "paper", "scissors"];
      const bot = choices[Math.floor(Math.random() * 3)];
      const player = interaction.customId;

      let result = "";

      if (player === bot) {
        result = "เสมอ 🤝";
      } else if (
        (player === "rock" && bot === "scissors") ||
        (player === "paper" && bot === "rock") ||
        (player === "scissors" && bot === "paper")
      ) {
        result = "ชนะ 🎉 +10 coins";
        const user = getUser(userId);
        user.coins += 10;
        user.wins += 1;
        updateUser(userId, user);
        addXP(userId, 20);
      } else {
        result = "แพ้ ☠️";
        const user = getUser(userId);
        user.losses += 1;
        updateUser(userId, user);
      }

      return interaction.update({
        content: `คุณ: ${player}\nบอท: ${bot}\nผล: ${result}`,
        components: [],
      });
    }

    // ================= PROFILE =================
    if (interaction.customId === "profile") {
      const user = getUser(userId);

      const embed = new EmbedBuilder()
        .setTitle("📊 โปรไฟล์")
        .setDescription(
          `💰 Coins: ${user.coins}\n⭐ Level: ${user.level}\n🎯 XP: ${user.xp}\n🏆 Wins: ${user.wins}\n💀 Losses: ${user.losses}`
        );

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // ================= LEADERBOARD =================
    if (interaction.customId === "leaderboard") {
      const users = loadUsers();
      const sorted = Object.entries(users)
        .sort((a, b) => b[1].coins - a[1].coins)
        .slice(0, 5);

      let text = "";
      sorted.forEach((u, i) => {
        text += `${i + 1}. <@${u[0]}> - ${u[1].coins} coins\n`;
      });

      return interaction.reply({
        content: text || "ยังไม่มีข้อมูล",
      });
    }

    // ================= DAILY =================
    if (interaction.customId === "daily") {
      const user = getUser(userId);
      user.coins += 50;
      updateUser(userId, user);

      return interaction.reply({
        content: "🎁 ได้ 50 coins แล้ว",
        ephemeral: true,
      });
    }

    // ================= SHOP =================
    if (interaction.customId === "shop") {
      const embed = new EmbedBuilder()
        .setTitle("🛒 ร้านค้า")
        .setDescription("เลือกซื้อสินค้า");

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("buy_theme")
          .setLabel("Red Theme - 200")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("buy_vip")
          .setLabel("VIP Badge - 500")
          .setStyle(ButtonStyle.Success)
      );

      return interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });
    }

    if (interaction.customId === "buy_theme") {
      const user = getUser(userId);
      if (user.coins < 200)
        return interaction.reply({
          content: "เงินไม่พอ",
          ephemeral: true,
        });

      user.coins -= 200;
      user.items.push("Red Theme");
      updateUser(userId, user);

      return interaction.reply({
        content: "ซื้อ Red Theme สำเร็จ",
        ephemeral: true,
      });
    }

    if (interaction.customId === "buy_vip") {
      const user = getUser(userId);
      if (user.coins < 500)
        return interaction.reply({
          content: "เงินไม่พอ",
          ephemeral: true,
        });

      user.coins -= 500;
      user.items.push("VIP Badge");
      updateUser(userId, user);

      return interaction.reply({
        content: "ซื้อ VIP สำเร็จ",
        ephemeral: true,
      });
    }
  }
});

// ================= EXPRESS KEEP ALIVE =================

const app = express();
app.get("/", (req, res) => res.send("Bot Running"));
app.listen(process.env.PORT || 3000);

// ================= READY =================

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(TOKEN);
