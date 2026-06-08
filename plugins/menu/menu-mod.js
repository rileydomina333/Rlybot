import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (message, { conn, usedPrefix, command }) => {
    const userId = message.sender;
    const groupId = message.isGroup ? message.chat : null;

    const menuText = generateMenuText(usedPrefix, userId, groupId);
    const imagePath = path.join(__dirname, '../../media/IMG-20260608-WA0113.jpg');

    await conn.sendMessage(message.chat, {
        image: { url: imagePath },
        caption: menuText,
        footer: '💠 Menu Moderatore',
        buttons: [
            { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '💠 Menu Principale' }, type: 1 },
            { buttonId: `${usedPrefix}menuadmin`, buttonText: { displayText: '💠 Menu Admin' }, type: 1 },
            { buttonId: `${usedPrefix}menuowner`, buttonText: { displayText: '💠 Menu Owner' }, type: 1 },
            { buttonId: `${usedPrefix}menusicurezza`, buttonText: { displayText: '💠 Menu Sicurezza' }, type: 1 },
            { buttonId: `${usedPrefix}menugruppo`, buttonText: { displayText: '💠 Menu Gruppo' }, type: 1 },
        ],
        viewOnce: true,
        headerType: 4,
    }, { quoted: message });
};

handler.help = [
  'menumod',
  'menumoderator',
  'menumoderatore',
  'modmenu'
];
handler.tags = ['menu'];
handler.command = /^(menumod|menumoderator|menumoderatore|modmenu|menúmod|menúmoderador|moderatormenü|菜单管理|менюмод|قائمةالمشرف|मॉडमेनू|menumodérateur|menumod_id|menumod_tr)$/i;

export default handler;

function generateMenuText(prefix, userId, groupId) {
    return `
╭┈ ─ ─ ✦ ─ ─ ┈╮
   ୧ 💠 ୭ *Menu Moderatore*
╰┈ ─ ─ ✦ ─ ─ ┈╯

╭★ Gestione Utenti ★╮
│ 💠 *${prefix}kick* @user — Rimuovi utente
│ 💠 *${prefix}muta* @user — Silenzia utente
│ 💠 *${prefix}smuta* @user — Ripristina utente
│ 💠 *${prefix}warn* @user — Avverti utente
│ 💠 *${prefix}unwarn* @user — Rimuovi warn
│ 💠 *${prefix}listawarn* — Lista avvertimenti
╰★───────────★╯

╭★ Gestione Gruppo ★╮
│ 💠 *${prefix}del* — Elimina un messaggio
│ 💠 *${prefix}hidetag* testo — Menziona tutti
│ 💠 *${prefix}tagall* — Tagga tutti
│ 💠 *${prefix}aperto* / *${prefix}chiuso* — Apri/Chiudi gruppo
│ 💠 *${prefix}inattivi* — Gestisci inattivi
╰★───────────★╯

╭★ Info ★╮
│ 💠 *${prefix}listmod* — Lista moderatori
╰★───────────★╯

╭★ Non disponibili per mod
│ 💠 *promuovi* — Solo admin
│ 💠 *retrocedi* — Solo admin
╰★───────────★╯

> © Powered by 𝐑𝐋𝐘 𝐁𝐎𝐓
`.trim();
}
