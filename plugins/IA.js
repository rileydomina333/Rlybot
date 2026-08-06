let botAttivo = {}; // { 'chatid': true/false }

// Risposte AI locali - puoi espanderle
const risposteIA = {
    "ciao": ["Ciao! Come va? 👑", "Ehilà! Dimmi tutto", "Salve signore ✨"],
    "come stai": ["Bene grazie! E tu?", "Sto alla grande. Tu come stai?", "Vivo e vegeto 😎"],
    "che fai": ["Sto qui ad aspettare i tuoi ordini", "Nulla, parlo con te", "Ti sto ascoltando"],
    "aiutami": ["Dimmi pure, come posso aiutarti?", "Sono qui per te", "Spiegami il problema"],
    "grazie": ["Di nulla 👑", "Prego!", "Figurati"],
    "ti voglio bene": ["Anch'io a te ❤️", "Aww grazie", "Cuore"],
    "default": ["Mhmm interessante", "Dimmi di più", "Non ho capito bene, spiega", "Sono qui 👑", "Continua pure"]
};

function trovaRisposta(text) {
    text = text.toLowerCase();
    for (let key in risposteIA) {
        if (text.includes(key)) {
            const arr = risposteIA[key];
            return arr[Math.floor(Math.random() * arr.length)];
        }
    }
    const arr = risposteIA["default"];
    return arr[Math.floor(Math.random() * arr.length)];
}

let handler = async (m, { conn, text, command, args, usedPrefix }) => {
    const chatId = m.chat;

    // COMANDI ON/OFF
    if (args[0]?.toLowerCase() === 'on') {
        botAttivo[chatId] = true;
        return m.reply(`✅ *ℝ𝕃𝕐 𝔹𝕆𝕋 AI ATTIVATA*\n\nModalità: OFFLINE 100%\nRispondo a tutti i messaggi.\nPer disattivare: *${usedPrefix}bot off*`);
    }
    if (args[0]?.toLowerCase() === 'off') {
        botAttivo[chatId] = false;
        return m.reply(`❌ *ℝ𝕃𝕐 𝔹𝕆𝕋 AI DISATTIVATA*\n\nNon risponderò più finché non fai *${usedPrefix}bot on*`);
    }
    if (!args[0]) {
        const stato = botAttivo[chatId]? '🟢 ATTIVA' : '🔴 DISATTIVA';
        return m.reply(`🤖 *ℝ𝕃𝕐 𝔹𝕆𝕋 AI*\nStato: ${stato}\nModalità: OFFLINE\nComandi:\n*${usedPrefix}bot on* | Attiva\n*${usedPrefix}bot off* | Disattiva`);
    }

    // RISPOSTA IA - SOLO SE ATTIVA
    if (!botAttivo[chatId]) return;
    if (m.isBaileys) return;
    if (text.startsWith(usedPrefix)) return;

    await conn.sendPresenceUpdate('composing', m.chat);
    await new Promise(resolve => setTimeout(resolve, 1000)); // finge che "sta scrivendo"

    let reply = trovaRisposta(text);
    await m.reply(reply);
}

handler.help = ['bot on/off'];
handler.tags = ['ai'];
handler.command = /^bot$/i;
handler.all = true; // ascolta tutti i messaggi

export default handler;