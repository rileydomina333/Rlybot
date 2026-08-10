import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (message, { conn, usedPrefix, command }) => {
    const userId = message.sender;
    const groupId = message.isGroup ? message.chat : null;
    const menuText = generateMenuText(usedPrefix, userId, groupId);
    const imagePath = path.join(__dirname, '../../media/WA_1782994956052.jpeg');
    const footerText = 'Scegli un menu:';
    const mainMenuText = '💠 Menu Principale';
    const adminMenuText = '💠 Menu Admin';
    const securityMenuText = '💠 Menu Sicurezza';
    const groupMenuText = '💠 Menu Gruppo';
    
    await conn.sendMessage(message.chat, {
        image: fs.existsSync(imagePath) ? { url: imagePath } : { url: 'https://telegra.ph/file/710185c7e0247662d8ca6.png' },
        caption: menuText,
        footer: footerText,
        buttons: [
            { buttonId: `${usedPrefix}menu`, buttonText: { displayText: mainMenuText }, type: 1 },
            { buttonId: `${usedPrefix}menuadmin`, buttonText: { displayText: adminMenuText }, type: 1 },
            { buttonId: `${usedPrefix}menusicurezza`, buttonText: { displayText: securityMenuText }, type: 1 },
            { buttonId: `${usedPrefix}menugruppo`, buttonText: { displayText: groupMenuText }, type: 1 },
            { buttonId: `${usedPrefix}menumod`, buttonText: { displayText: '🛡️ Menu Mod' }, type: 1 },
        ],
        viewOnce: true,
        headerType: 4,
    }, { quoted: message });
};

handler.help = ['menuowner'];
handler.tags = ['menu'];
handler.command = /^(menuowner|menupadrone|menupropietario)$/i;

export default handler;

function generateMenuText(prefix, userId, groupId) {
    const vs = global.vs || '1.0.0';
    
    const createSection = (title, commands) => {
        const commandLines = commands.trim().split('\n').filter(c => c.trim()).map(c => `► ${c.trim()}`).join('\n');
        return `[ ${title} ]\n${commandLines}`;
    };
    
    const sections = [
        createSection('👑 GESTIONE UTENTI GLOBALI', `
*${prefix}manage* @ | Gestisci utente
*${prefix}ban* @ | Ban utente globale
*${prefix}unban* @ | Unban utente
*${prefix}reset* @ | Reset dati utente
*${prefix}add* (num) @ | Aggiungi messaggi
*${prefix}remove* (num) @ | Rimuovi messaggi`),

        createSection('🏢 GESTIONE GRUPPI', `
*${prefix}setgroups* | Imposta gruppi
*${prefix}addgroups* @ | Aggiungi gruppo
*${prefix}resetgroups* @ | Reset gruppo
*${prefix}join* link | Entra in gruppo
*${prefix}out* | Esci dal gruppo
*${prefix}banchat* (gruppo) | Ban chat
*${prefix}unbanchat* (gruppo) | Unban chat
*${prefix}everygroup* comando | Esegui in tutti i gruppi`),

        createSection('⚙️ BOT & SISTEMA', `
*${prefix}cleanup* | Pulisci database
*${prefix}restart* | Riavvia bot
*${prefix}shutdown* | Spegni bot
*${prefix}update* | Aggiorna bot
*${prefix}prefix* ? | Cambia prefisso
*${prefix}resetprefix* | Reset prefisso
*${prefix}godmode* {auto} | Modalità dio`),

        createSection('📁 FILE & PLUGIN', `
*${prefix}getfile* | Prendi file
*${prefix}save* plugin | Salva plugin
*${prefix}dp* plugin | Cancella plugin
*${prefix}getplugin* | Scarica plugin`),

        createSection('📊 INFO OWNER', `
*${prefix}stats* | Statistiche bot
*${prefix}ping* | Ping bot
*${prefix}listban* | Lista ban`)
    ];

    return `▰▰▰▰▰▰▰▰
    💠  𝑴𝑬𝑵𝑼 𝑶𝑾𝑵𝑬𝑹  💠
▰▰▰▰▰▰▰▰

*Comandi riservati all'Owner*

${sections.join('\n\n')}

▰
   Powered by ℝ𝕃𝕐 𝔹𝕆𝕋 ✨
Versione: v${vs}`.trim();
}