const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "database.json");

let data = { users: {} };

if (fs.existsSync(filePath)) {
  data = JSON.parse(fs.readFileSync(filePath));
}

function saveDB() {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getUser(id) {
  if (!data.users[id]) {
    data.users[id] = {
      xp: 0,
      level: 1,
      coin: 0
    };
  }
  return data.users[id];
}

module.exports = { getUser, saveDB };
