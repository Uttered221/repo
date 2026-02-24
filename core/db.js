const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "db.json");

// ถ้าไม่มีไฟล์ ให้สร้างใหม่
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify({ users: {} }, null, 2));
}

// โหลดข้อมูล
function loadDB() {
  const raw = fs.readFileSync(filePath);
  return JSON.parse(raw);
}

// เซฟข้อมูล
function saveDB(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ดึง user
function getUser(id) {
  const db = loadDB();
  if (!db.users[id]) {
    db.users[id] = { xp: 0, level: 1, coin: 0 };
    saveDB(db);
  }
  return db.users[id];
}

module.exports = { loadDB, saveDB, getUser };
