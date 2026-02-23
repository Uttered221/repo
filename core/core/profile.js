const { db, saveDB } = require("./database");

function ensureUser(userId) {
  if (!db.users[userId]) {
    db.users[userId] = {
      money: 0,
      xp: 0,
      level: 1
    };
  }
}

function addReward(userId, money, xp) {
  ensureUser(userId);

  db.users[userId].money += money;
  db.users[userId].xp += xp;

  // level up
  const needed = db.users[userId].level * 100;

  if (db.users[userId].xp >= needed) {
    db.users[userId].xp -= needed;
    db.users[userId].level++;
  }

  saveDB();
}

function getProfile(userId) {
  ensureUser(userId);
  return db.users[userId];
}

function getLeaderboard() {
  return Object.entries(db.users)
    .sort((a, b) => b[1].money - a[1].money)
    .slice(0, 10);
}

module.exports = {
  addReward,
  getProfile,
  getLeaderboard,
  ensureUser
};
