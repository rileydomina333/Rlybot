import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (message, { conn, usedPrefix, command }) => {
    const userId = message.sender;
    const groupId = message.isGroup ? message.chat : null;

    const menuText = generateMenuText(usedPrefix, userId, groupId);
    const imagePath = path.join(__dirname, '../../media/WA_1782994943475.jpeg');
    const footerText = 'Scegli un menu:';
    const mainMenuText = '💠 Menu Principale';
    const ownerMenuText = '💠 Menu Owner';
    const securityMenuText = '💠 Menu Sicurezza';
    const groupMenuText = '💠 Menu Gruppo';

    await conn.sendMessage(message.chat, {
        image: { url: imagePath },
        caption: menuText,
        footer: footerText,
        buttons: [
            { buttonId: `${usedPrefix}menu`, buttonText: { displayText: mainMenuText }, type: 1 },
            { buttonId: `${usedPrefix}menuowner`, buttonText: { displayText: ownerMenuText }, type: 1 },
            { buttonId: `${usedPrefix}menusicurezza`, buttonText: { displayText: securityMenuText }, type: 1 },
            { buttonId: `${usedPrefix}menugruppo`, buttonText: { displayText: groupMenuText }, type: 1 },
            { buttonId: `${usedPrefix}menumod`, buttonText: { displayText: '🛡️ Menu Mod' }, type: 1 },
        ],
        viewOnce: true,
        headerType: 4,
    }, { quoted: message });
};

handler.help = ['menuadmin', 'adminmenu'];
handler.tags = ['menuadmin'];
handler.command = /^(menuadmin|adminmenu)$/i;

export default handler;

function generateMenuText(prefix, userId, groupId) {
    
    const createSection = (title, commands) => {
        const commandLines = commands.trim().split('\n').filter(c => c.trim()).map(c => `► ${c.trim()}`).join('\n');
        return `[ ${title} ]\n${commandLines}`;
    };
    
    const sections = [
        createSection('🛡️ GESTIONE MEMBRI', `
*.promote* @ | Promuovi admin
*.demote* @ | Degrada admin
*.kick* @ | Espelli utente
*.warn* @ | Ammonisci utente
*.unwarn* @ | Rimuovi warn
*.listwarn* @ | Lista warn
*.mute* @ | Muta utente
*.unmute* @ | Smuta utente`),

        createSection('⚙️ IMPOSTAZIONI GRUPPO', `
*.setname* | Cambia nome gruppo
*.setdesc* | Cambia descrizione
*.setpp* | Cambia foto gruppo
*.link* | Link invito gruppo
*.linkqr* | QR link gruppo
*.open* | Apri gruppo
*.close* | Chiudi gruppo
*.rules* | Imposta regole`),

        createSection('📢 TAG & COMUNICAZIONI', `
*.tagall* | Taggare tutti
*.hidetag* | Tag nascosto
*.admins* | Tagga gli admin
*.totag* | Tagga specifici`),

        createSection('🧹 PULIZIA & UTILITÀ', `
*.cleanup* | Pulisci inattivi
*.inactive* | Lista inattivi
*.listnum* | Lista numeri
*.requests* | Richieste gruppo
*.welcome* on/off | Benvenuto
*.bye* on/off | Addio
*.antibot* on/off | Anti bot
*.antilink* on/off | Anti link`),

        createSection('📊 INFO & LOG', `
*.groupinfo* | Info gruppo
*.adminlist* | Lista admin
*.membercount* | Conta membri
*.gclog* | Log gruppo`)
    ];

    return `▰▰▰▰▰▰▰▰▰▰▰▰
    💠  𝑴𝑬𝑵𝑼 𝑨𝑫𝑴𝑰𝑵  💠
▰▰▰▰▰▰▰▰▰▰▰▰

${sections.join('\n\n')}

▰
   Powered by ℝ𝕃𝕐 𝔹𝕆𝕋 ✨
Versione: v1.0.0`.trim();
}