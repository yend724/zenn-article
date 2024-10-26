import { execSync } from 'child_process';

const generateRandom = (length: number = 16): string => {
  const s = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length })
    .map(() => s[Math.floor(Math.random() * s.length)])
    .join('');
};

const generateDate = (): string => {
  const year = '0000';
  const month = '00';
  const date = '00';
  return `${year}${month}${date}`;
};

execSync(`npx zenn new:article --slug ${generateDate()}-${generateRandom()}`);
