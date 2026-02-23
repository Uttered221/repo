const { getUser, saveDB } = require("./data");

function addXP(id, amount) {
  const user = getUser(id);
  user.xp += amount;
  const need = user.level * 200;

  if (user.xp >= need) {
    user.xp -= need;
    user.level++;
  }

  saveDB();
}

function addCoin(id, amount) {
  const user = getUser(id);
  user.coin += amount;
  if (user.coin < 0) user.coin = 0;
  saveDB();
}

function levelBonus(id) {
  const user = getUser(id);
  return 1 + user.level * 0.05;
}

module.exports = { addXP, addCoin, levelBonus };
