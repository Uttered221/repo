const { db, saveDB } = require("./database");

function createRoom(channelId, ownerId, game) {
  db.rooms[channelId] = {
    owner: ownerId,
    game,
    state: {},
    created: Date.now()
  };
  saveDB();
}

function deleteRoom(channelId) {
  delete db.rooms[channelId];
  saveDB();
}

function getRoom(channelId) {
  return db.rooms[channelId];
}

module.exports = { createRoom, deleteRoom, getRoom };
