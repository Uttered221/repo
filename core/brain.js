const {
  addXP,
  addCoin
} = require("./database");

// ==== import เกมทั้งหมด ====
const speeduno = require("./speeduno");
const elementwar = require("./elementwar");
const dailyreward = require("./dailyreward");
const duel = require("./duel");
const boss = require("./boss");
const critical = require("./criticalbattle");
const diceroll = require("./diceroll");
const hangman = require("./hangman");
const numberguess = require("./numberguess");
const quiz = require("./quiz");
const slot = require("./slot");
const uno = require("./uno");
const wordchain = require("./wordchain");

// =====================================

async function brain(interaction) {

  // ==============================
  // SLASH COMMAND
  // ==============================
  if (interaction.isChatInputCommand()) {

  const { commandName } = interaction;

  if (commandName === "ping") {
    return interaction.reply({ content: "pong", ephemeral: true });
  }

  return interaction.reply({
    content: `ยังไม่มี handler สำหรับ ${commandName}`,
    ephemeral: true
  });
  }
  // ==============================
  // BUTTON
  // ==============================
  if (interaction.isButton()) {

    const id = interaction.customId;

    // ===== DAILY =====
    if (id === "daily_claim") {
      const result = dailyreward.claimDaily(interaction.user.id);
      const embed = dailyreward.buildDailyEmbed(result);

      return interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }

    // ===== SPEED UNO =====
    if (id.startsWith("speeduno_play_")) {

      const roomId = id.split("_")[2];

      speeduno.playCard(roomId, interaction.user.id);

      addCoin(interaction.user.id, 10);
      addXP(interaction.user.id, 5);

      return interaction.deferUpdate();
    }

    // ===== ELEMENT WAR =====
    if (id.startsWith("element_")) {

      const parts = id.split("_");
      const element = parts[1];
      const roomId = parts[2];

      elementwar.chooseElement(roomId, interaction.user.id, element);

      return interaction.deferUpdate();
    }

    // ===== เพิ่มเกมอื่น pattern เดียวกัน =====

  }

}

module.exports = { brain };
