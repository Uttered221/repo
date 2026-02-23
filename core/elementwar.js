const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { db, saveDB } = require("./database");

function startElementWar(roomId) {
  const room = db.rooms[roomId];
  if (!room) return;

  room.gameData = {
    choices: {},
    winner: null
  };

  room.state = "playing";
  saveDB();
}

function chooseElement(roomId, userId, element) {
  const room = db.rooms[roomId];
  if (!room) return;

  room.gameData.choices[userId] = element;

  if (Object.keys(room.gameData.choices).length === 2) {
    resolveBattle(roomId);
  }

  saveDB();
}

function resolveBattle(roomId) {
  const room = db.rooms[roomId];
  const players = Object.keys(room.gameData.choices);

  const p1 = players[0];
  const p2 = players[1];

  const e1 = room.gameData.choices[p1];
  const e2 = room.gameData.choices[p2];

  if (e1 === e2) return;

  if (
    (e1 === "fire" && e2 === "earth") ||
    (e1 === "earth" && e2 === "water") ||
    (e1 === "water" && e2 === "fire")
  ) {
    room.gameData.winner = p1;
  } else {
    room.gameData.winner = p2;
  }

  room.state = "ended";
  delete db.rooms[roomId];
}

function buildElementEmbed(room) {
  const data = room.gameData;

  if (data.winner) {
    return new EmbedBuilder()
      .setTitle("🏆 ผู้ชนะ")
      .setColor(0x00ff00)
      .setDescription(`<@${data.winner}> ชนะศึกธาตุ`);
  }

  return new EmbedBuilder()
    .setTitle("🌪️ ELEMENT WAR")
    .setColor(0x9966ff)
    .setDescription("เลือกธาตุของคุณ");
}

function buildElementButtons(room) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`element_fire_${room.id}`)
        .setLabel("🔥 ไฟ")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`element_water_${room.id}`)
        .setLabel("💧 น้ำ")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`element_earth_${room.id}`)
        .setLabel("🌱 ดิน")
        .setStyle(ButtonStyle.Success)
    )
  ];
}

module.exports = {
  startElementWar,
  chooseElement,
  buildElementEmbed,
  buildElementButtons
};
