const fs = require("fs");

const DB_FILE = "./database.json";

let db = {
  users: {},
  rooms: {},
  jackpot: 0,
  season: 1
};

function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE));
  }
}

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function getUser(id) {
  if (!db.users[id]) {
    db.users[id] = {
      coin: 1000,
      xp: 0,
      level: 1,
      win: 0,
      lose: 0,
      achievement: []
    };
  }
  return db.users[id];
}

module.exports = { db, loadDB, saveDB, getUser };
