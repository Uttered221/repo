const speed = require("./speed");
const profile = require("./profile");
const leaderboard = require("./leaderboard");
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
  /// ===== SLASH COMMAND =====
if (interaction.isChatInputCommand()) {
  const { commandName } = interaction;

  if (commandName === "ping") {
    return interaction.reply({ content: "pong", ephemeral: true });
  }

  if (commandName === "speeduno") return speeduno.run(interaction);
  if (commandName === "speed") return speed.run(interaction);
  if (commandName === "elementwar") return elementwar.run(interaction);
  if (commandName === "quiz") return quiz.run(interaction);
  if (commandName === "slot") return slot.run(interaction);
  if (commandName === "hangman") return hangman.run(interaction);
  if (commandName === "numberguess") return numberguess.run(interaction);
  if (commandName === "duel") return duel.run(interaction);
  if (commandName === "boss") return boss.run(interaction);
  if (commandName === "criticalbattle") return critical.run(interaction);
  if (commandName === "diceroll") return diceroll.run(interaction);
  if (commandName === "uno") return uno.run(interaction);
  if (commandName === "wordchain") return wordchain.run(interaction);
  if (commandName === "daily") return dailyreward.run(interaction);
  if (commandName === "profile") return profile.run(interaction);
  if (commandName === "leaderboard") return leaderboard.run(interaction);

  return interaction.reply({
   content: `ยังไม่มี handler สำหรับ ${commandName}`,
   ephemeral: true
});

} //

// ===== BUTTON =====
if (interaction.isButton()) {

    const id = interaction.customId;

    if (id.startsWith("element_")) {

      const parts = id.split("_");
      const element = parts[1];
      const roomId = parts[2];

      elementwar.chooseElement(roomId, interaction.user.id, element);

      return interaction.deferUpdate();
    }
  }

} //

module.exports = { brain };
