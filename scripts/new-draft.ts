const { execSync } = require('child_process');

const generateRandom = (length = 16) => {
  const s = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const n = length;
  const r = Array.from({ length: n })
    .map(() => s[Math.floor(Math.random() * s.length)])
    .join('');
  return r;
};
const generateDummyDate = () => {
  const now = new Date();
  const year = '0000';
  const month = '00';
  const date = '00';
  return year + month + date;
};

execSync(
  `npx zenn new:article --slug ${generateDummyDate()}-${generateRandom()}`
);
