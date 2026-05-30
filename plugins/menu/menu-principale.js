import { performance } from 'perf_hooks';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (message, { conn, usedPrefix, command }) => {
    const userId = message.sender;
    const groupId = message.isGroup ? message.chat : null;

    const userCount = Object.keys(global.db.data.users).length;
    const botName = "ℝ𝕃𝕐 𝔹𝕆𝕋"; 

    const menuText = generateMenuText(usedPrefix, botName, userCount, userId, groupId);

    const photopath = path.join(__dirname, '../../media/WA_1780014746420.jpeg'); 

    const footerText = `Powered by ℝ𝕃𝕐 𝔹𝕆𝕋 ✨`;

    await conn.sendMessage(
        message.chat,
        {
            image: { url: photopath },
            caption: menuText,
            footer: footerText,
            buttons: [
                { buttonId: `${usedPrefix}menuadmin`, buttonText: { displayText: '👮‍♂️ Admin' }, type: 1 },
                { buttonId: `${usedPrefix}menuowner`, buttonText: { displayText: '👑 Owner' }, type: 1 },
                { buttonId: `${usedPrefix}menusicurezza`, buttonText: { displayText: '🛡️ Sicurezza' }, type: 1 },
                { buttonId: `${usedPrefix}menugruppo`, buttonText: { displayText: '👥 Gruppo' }, type: 1 },
                { buttonId: `${usedPrefix}menumod`, buttonText: { displayText: '🛠️ Mod' }, type: 1 },
            ],
            viewOnce: true,
            headerType: 4
        },
        { quoted: message }
    );
};

handler.help = ['menu'];
handler.tags = ['menu'];
handler.command = /^(menu|comandi|commands|menú|comandos)$/i;

export default handler;

function generateMenuText(prefix, botName, userCount, userId, groupId) {
    const vs = global.vs || '1.5.0';
    
    return `
┏━━〔 ✨ *${botName}* ✨ 〕━━┓
┃
┃  💠 *Utente:* @${userId.split('@')[0]}
┃  💠 *Database:* ${userCount}
┃  💠 *Versione:* ${vs}
┃
┣━━〔 💠 *SISTEMA* 〕━━┓
┃ 💠 \`${prefix}installa\`
┃ 💠 \`${prefix}sistema\`
┃ 💠 \`${prefix}ping\`
┃
┣━━〔 💠 *INTELLIGENZA* 〕━━┓
┃ 💠 \`${prefix}rlybot\`
┃ 💠 \`${prefix}lingua\`
┃
┣━━〔 💠 *ASSISTENZA* 〕━━┓
┃ 💠 \`${prefix}report\`
┃ 💠 \`${prefix}suggerisci\`
┃
┗━━━━━━━━━━━━━━━━━━┛`.trim();
}
