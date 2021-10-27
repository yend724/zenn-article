const { execSync } = require("child_process");
const s = "abcdefghijklmnopqrstuvwxyz0123456789";
const n = 16;
const r = Array.from({ length: n })
  .map(() => s[Math.floor(Math.random() * s.length)])
  .join("");
const now = new Date();
const year = now.getFullYear();
const month = ("0" + (now.getMonth() + 1)).slice(-2);
const date = ("0" + now.getDate()).slice(-2);
const prefix = year + month + date;

execSync(`npx zenn new:article --slug ${prefix}-${r}`);
