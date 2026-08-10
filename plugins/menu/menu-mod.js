import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (message, { conn, usedPrefix, command }) => {
    const userId = message.sender;
    const groupId = message.isGroup ? message.chat : null;

    const menuText = generateMenuText(usedPrefix, userId, groupId);
    const imagePath = path.join(__dirname, '../../media/WA_1782994929859.jpeg');
    const footerText = 'Scegli un menu:';

    await conn.sendMessage(message.chat, {
        image: { url: imagePath },
        caption: menuText,
        footer: footerText,
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

handler.help = ['menumod', 'modmenu'];
handler.tags = ['menu'];
handler.command = /^(menumod|modmenu|menumoderatore)$/i;

export default handler;

function generateMenuText(prefix, userId, groupId) {
    
    const createSection = (title, commands) => {
        const commandLines = commands.trim().split('\n').filter(c => c.trim()).map(c => `► ${c.trim()}`).join('\n');
        return `[ ${title} ]\n${commandLines}`;
    };
    
    const sections = [
        createSection('🛡️ GESTIONE UTENTI', `
*${prefix}kick* @user | Rimuovi utente
*${prefix}muta* @user | Silenzia utente
*${prefix}smuta* @user | Ripristina utente
*${prefix}warn* @user | Ammonisci utente
*${prefix}unwarn* @user | Rimuovi warn
*${prefix}listawarn* | Lista avvertimenti`),

        createSection('⚙️ GESTIONE GRUPPO', `
*${prefix}del* | Elimina un messaggio
*${prefix}hidetag* testo | Menziona tutti nascosto
*${prefix}tagall* | Tagga tutti
*${prefix}aperto* / *${prefix}chiuso* | Apri/Chiudi gruppo
*${prefix}inattivi* | Gestisci inattivi`),

        createSection('ℹ️ INFO', `
*${prefix}listmod* | Lista moderatori
*${prefix}groupinfo* | Info gruppo`),

        createSection('🚫 NON DISPONIBILI PER MOD', `
*promuovi* | Solo Admin
*retrocedi* | Solo Admin
*setname* | Solo Admin
*setdesc* | Solo Admin`)
    ];

    return `▰▰▰▰▰▰▰▰▰▰▰▰
    💠  𝑴𝑬𝑵𝑼 𝑴𝑶𝑫𝑬𝑹𝑨𝑻𝑶𝑹𝑬  💠
▰▰▰▰▰▰▰▰▰▰▰▰

${sections.join('\n\n')}

▰
   Powered by ℝ𝕃𝕐 𝔹𝕆𝕋 ✨
Versione: v1.0.0`.trim();
}