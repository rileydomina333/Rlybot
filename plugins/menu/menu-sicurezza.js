import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handler = async (m, { conn, usedPrefix, command }) => {
    const userId = m.sender;
    const groupId = m.isGroup ? m.chat : null;
    const chat = global.db.data.chats[m.chat] || {};
    const imagePath = path.join(__dirname, '../../media/WA_1780014736447.jpeg');

    const botName = "ℝ𝕃𝕐 𝔹𝕆𝕋";
    const menuText = generateMenuText(chat, userId, groupId, botName, usedPrefix);
    
    const footerText = `𝕊𝕖𝕝𝕖𝕫𝕚𝕠𝕟𝕒 𝕦𝕟𝕒 𝕔𝕒𝕥𝕖𝕘𝕠𝕣𝕚𝕒 💠`;

    await conn.sendMessage(m.chat, {
        image: { url: imagePath },
        caption: menuText,
        footer: footerText,
        buttons: [
            { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '💠 Menu Principale' }, type: 1 },
            { buttonId: `${usedPrefix}menuadmin`, buttonText: { displayText: '💠 Menu Admin' }, type: 1 },
            { buttonId: `${usedPrefix}menuowner`, buttonText: { displayText: '💠 Menu Owner' }, type: 1 },
            { buttonId: `${usedPrefix}menugruppo`, buttonText: { displayText: '💠 Menu Gruppo' }, type: 1 },
            { buttonId: `${usedPrefix}menumod`, buttonText: { displayText: '💠 Menu Mod' }, type: 1 },
        ],
        viewOnce: true,
        headerType: 4,
    }, { quoted: m });
};

handler.help = ['menusicurezza'];
handler.tags = ['menu'];
handler.command = /^(menusicurezza|securitymenu|menusecurity|safety)$/i;

export default handler;

function generateMenuText(chat, userId, groupId, botName, usedPrefix) {
    const vs = global.vs || '1.5.0';
    
    const functions = {
        "Anti Link": !!chat?.antiLink,
        "Anti Link Hard": !!chat?.antiLinkHard,
        "Anti Spam": !!chat?.antispam,
        "Anti Trava": !!chat?.antitrava,
        "Benvenuto": !!chat?.welcome,
        "Addio": !!chat?.bye,
        "Anti Bestemmie": !!chat?.antibestemmie,
        "Solo Admin": !!chat?.soloadmin,
        "Anti Porno": !!chat?.antiporno,
        "Anti Call": !!chat?.antiCall,
        "Anti Virus": !!chat?.antivirus,
        "Anti Bot": !!chat?.antibot,
        "Anti Media": !!chat?.antimedia,
        "Anti TikTok": !!chat?.antitiktok,
        "Anti Bot": !!chat?.antibot,
        "Anti gore": !!chat?.antigore,
        "Anti nuke": !!chat?.antinuke
    };

    const statusList = Object.entries(functions)
        .map(([name, state]) => `┃ ${state ? '🟢' : '🔴'} *${name}*`)
        .join('\n');

    return `
┏━━〔 💠 *${botName}* 💠 〕━━┓
┃
┃ 💠 *SICUREZZA & FUNZIONI*
┃
┣━━〔 💠 *GUIDA* 〕━━┓
┃ 🟢 .attiva <funzione>
┃ 🔴 .disabilita <funzione>
┃
┣━━〔 💠 *STATO* 〕━━┓
${statusList}
┃
┣━━〔 💠 *INFO* 〕━━┓
┃ 💠 *Versione:* ${vs}
┃ 💠 *ID:* @${userId.split('@')[0]}
┃
┗━━━━━━━━━━━━━━━━━━┛`.trim();
}
