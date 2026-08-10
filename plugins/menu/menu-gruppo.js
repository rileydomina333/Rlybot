import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (message, { conn, usedPrefix, command }) => {
    const userId = message.sender;
    const groupId = message.isGroup ? message.chat : null;
    
    const menuText = generateMenuText(usedPrefix, userId, groupId);
    const imagePath = path.join(__dirname, '../../media/WA_1782994972105.jpeg');
    const footerText = 'Scegli una categoria dal menu:';
    const mainMenuText = '💠 Menu Principale';
    const adminMenuText = '💠 Menu Admin';
    const ownerMenuText = '💠 Menu Owner';
    const securityMenuText = '💠 Menu Sicurezza';
    
    await conn.sendMessage(message.chat, {
        image: { url: imagePath },
        caption: menuText,
        footer: footerText,
        buttons: [
            { buttonId: `${usedPrefix}menu`, buttonText: { displayText: mainMenuText }, type: 1 },
            { buttonId: `${usedPrefix}menuadmin`, buttonText: { displayText: adminMenuText }, type: 1 },
            { buttonId: `${usedPrefix}menuowner`, buttonText: { displayText: ownerMenuText }, type: 1 },
            { buttonId: `${usedPrefix}menusicurezza`, buttonText: { displayText: securityMenuText }, type: 1 },
            { buttonId: `${usedPrefix}menumod`, buttonText: { displayText: '💠 Menu Mod' }, type: 1 },
        ],
        viewOnce: true,
        headerType: 4,
    }, { quoted: message });
};

handler.help = ['menugruppo', 'gruppo', 'groupmenu'];
handler.tags = ['menu'];
handler.command = /^(gruppo|menugruppo|groupmenu|group)$/i;

export default handler;

function generateMenuText(prefix, userId, groupId) {
    const vs = global.vs || '1.0.0';
    
    const createSection = (title, commands) => {
        const commandLines = commands.trim().split('\n').filter(c => c.trim()).map(c => `► ${c.trim()}`).join('\n');
        return `[ ${title} ]\n${commandLines}`;
    };
    
    const sections = [
        createSection('🎵 MUSICA & AUDIO', `
*.play* (canzone) | Cerca e invia mp3
*.playlist* | Crea playlist
*.ytsearch* | Cerca video YouTube
*.tomp3* (video) | Converti in mp3`),

        createSection('ℹ️ INFORMAZIONI & UTILITÀ', `
*.meteo* (città) | Meteo città
*.traduci* (testo) | Traduci testo
*.info* [@utente] | Info utente
*.regole* | Regole gruppo
*.dashboard* | Dashboard bot
*.offusca* | Offusca immagine`),

        createSection('🎨 IMMAGINI & MODIFICA', `
*.sticker* | Foto → sticker
*.hd* | Migliora qualità foto
*.bonk* | Meme bonk
*.toimg* | Sticker → immagine
*.hornycard* [@utente]
*.stupido/a* @ | Carta stupido
*.emojimix* | Mix emoji
*.wanted* @ | Manifesti wanted
*.scherzo* @ | Meme scherzo
*.nokia* @ | Telefono nokia
*.carcere* @ | Foto carcere
*.ads* @ | Pubblicità`),

        createSection('⚡ POKEMON', `
*.apripokemon* | Apri pacchetto
*.buypokemon* | Compra pokemon
*.classificapokemon* | Classifica
*.pacchetti* | I tuoi pacchetti
*.combatti* | Combatti
*.evolvi* | Evolvi pokemon
*.darknessinfo* | Info darkness
*.inventario* | Inventario
*.pity* | Contatore pity
*.scambia* | Scambia pokemon`),

        createSection('🎰 GIOCHI & CASINÒ', `
*.tris* | Gioca a tris
*.dado* | Tira dado
*.slot* | Slot machine
*.casinò* | Entra casinò
*.annuale* | Premio annuale
*.poker* | Poker
*.blockblast* | Block blast
*.scacchi* | Scacchi
*.scommessa* (q) | Scommetti
*.blackjack* | Blackjack
*.wordle* | Wordle
*.roulette* | Roulette
*.moneta* | Testa o croce
*.mate* | Problema mate
*.scf* | Sasso carta forbici
*.pokedex* | Info pokemon
*.bandiera* | Indovina bandiera
*.obbligo/verità* | Obbligo o verità
*.indovinacanzone* | Indovina canzone
*.auto* | Gioco auto
*.missioni* | Missioni giornaliere`),

        createSection('💰 ECONOMIA & CLASSIFICHE', `
*.portafoglio* | Saldo UC
*.banca* | Banca
*.daily* | Bonus giornaliero
*.topuser* | Top utenti
*.topgruppi* | Top gruppi
*.donauc* | Dona UC
*.ruba* @utente | Ruba UC
*.ritira* | Ritira UC
*.mina* | Mina XP
*.xp* | Vedi XP
*.donaxp* @ | Dona XP
*.rubaxp* @ | Ruba XP`),

        createSection('💞 INTERAZIONI SOCIALI', `
*.divorzia* | Fine relazione
*.amore* @ | Affinità
*.bacia* @ | Bacia
*.picchia* @ | Picchia
*.limona* @ | Limona
*.threesome* @ | Threesome
*.palpa* @ | Palpa
*.odio* @ | Odia
*.rizz* @ | Rizz
*.minaccia* @ | Minaccia
*.zizzania* @ | Crea litigi
*.ditalino* @ | Ditalino
*.sega* @ | Sega
*.sputa* @ | Sputa
*.cazzo* @ | Cazzo
*.figa* @ | Figa
*.twerk* @ | Twerk
*.tette* @ | Tette
*.insulta* @ | Insulta
*.amicizia/listamici* @`),

        createSection('📊 QUANTO È?', `
*.lesbica* @ | % lesbica
*.negro* @ | % negro
*.cornuto* @ | % cornuto`),

        createSection('🧪 TEST PERSONALITÀ', `
*.alcolizzato* | Test alcol
*.drogato* | Test droga`),

        createSection('👨‍👩‍👧 FAMIGLIA & ADOZIONE', `
*.adotta* @utente (500 UC)
*.abbandona* @utente
*.orfanotrofio*
*.famiglia*
*.diseredita* @utente
*.scappa*`),

        createSection('🗡️ RPG & AVVENTURA', `
*.duello* @utente <UC>
*.mostro*
*.esplora*
*.zaino*
*.vendizaino*
*.pesca*
*.inventariopesca*
*.vendipesce*`),

        createSection('💼 LAVORO & CRIMINE', `
*.lavora*
*.crimini*
*.proiettile*
*.crimine* <num>
*.rapina* @utente
*.clan* @4/5utenti
*.fedinapenale*`),

        createSection('🐾 PET', `
*.cercapet*
*.pet*
*.sfamapet* <num>
*.coccolapet* <num>
*.rilasciapet* <num>
*.arenapet* @utente`),

        createSection('👑 PROFILO & CLASSIFICHE', `
*.profilo* [@utente]
*.classifica*
*.clasxp*
*.clascrimine*`)
    ];
    
    return `▰▰▰
    💠  𝑴𝑬𝑵𝑼 𝑮𝑹𝑼𝑷𝑷𝑶  💠
▰▰▰▰▰▰▰▰▰▰▰

${sections.join('\n\n')}

▰▰▰
   Powered by ℝ𝕃𝕐 𝔹𝕆𝕋 ✨
Versione: v${vs}`.trim();
}