import fs from 'fs';
import os from 'os';
import { performance } from 'perf_hooks';

const toMathematicalAlphanumericSymbols = number => {
  const map = {
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒',
    '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗', '.': '.'
  };
  return number.toString().split('').map(digit => map[digit] || digit).join('');
};

const clockString = ms => {
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  return `${toMathematicalAlphanumericSymbols(days.toString().padStart(2, '0'))}:${toMathematicalAlphanumericSymbols(hours.toString().padStart(2, '0'))}:${toMathematicalAlphanumericSymbols(minutes.toString().padStart(2, '0'))}:${toMathematicalAlphanumericSymbols(seconds.toString().padStart(2, '0'))}`;
};

const handler = async (m, { conn }) => {

  const _uptime = process.uptime() * 1000;
  const uptime = clockString(_uptime);

  const old = performance.now();
  const neww = performance.now();
  const speed = (neww - old).toFixed(4);
  const speedWithFont = toMathematicalAlphanumericSymbols(speed);

  const totalMemBytes = os.totalmem();
  const freeMemBytes = os.freemem();
  const usedMemBytes = totalMemBytes - freeMemBytes;
  const totalMemMB = (totalMemBytes / (1024 * 1024)).toFixed(2);
  const usedMemMB = (usedMemBytes / (1024 * 1024)).toFixed(2);

  const processMemory = process.memoryUsage();
  const heapUsedMB = (processMemory.heapUsed / (1024 * 1024)).toFixed(2);
  const heapTotalMB = (processMemory.heapTotal / (1024 * 1024)).toFixed(2);

  const image = fs.readFileSync('./icone/ping.png');

  let nomeDelBot = global.db.data.nomedelbot || ' 𝐑𝐋𝐘 𝐁𝐎𝐓';

  const prova = {
    key: { participants: "0@s.whatsapp.net", fromMe: false, id: "Halo" },
    message: {
      documentMessage: {
        title: `${nomeDelBot} 𝗣𝗜𝗡𝗚 🏓`,
        jpegThumbnail: image
      }
    },
    participant: "0@s.whatsapp.net"
  };

  const info = 
𝗔𝗧𝗧𝗜𝗩𝗜𝗧𝗔̀: ${uptime}
𝗩𝗘𝗟𝗢𝗖𝗜𝗧𝗔̀: ${speedWithFont} 𝗦𝗘𝗖𝗢𝗡𝗗𝗜
𝗥𝗔𝗠 (server): ${usedMemMB} MB / ${totalMemMB} MB
𝗠𝗘𝗠 (process): ${heapUsedMB} MB / ${heapTotalMB} MB
ೋೋ══ • ══ೋೋ`.trim();

  await conn.sendMessage(m.chat, {
    text: info,
    footer: "𝐑𝐋𝐘 𝐁𝐎𝐓 𝐯𝐞𝐫𝐬𝐢𝐨𝐧𝐞 𝟏𝟎.𝟏",
    buttons: [
      { buttonId: ".ds", buttonText: { displayText: "🧹 Elimina Sessioni" }, type: 1 }
    ],
    headerType: 1
  }, { quoted: prova });
};

handler.command = /^(ping)$/i;
export default handler;