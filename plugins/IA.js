import fetch from 'node-fetch';

let botAttivo = {}; // { 'chatid': true/false }

let handler = async (m, { conn, text, command, args, usedPrefix }) => {
    const chatId = m.chat;

    // COMANDI ON/OFF
    if (args[0]?.toLowerCase() === 'on') {
        botAttivo[chatId] = true;
        return m.reply(`✅ *ℝ𝕃𝕐 𝔹𝕆𝕋 AI ATTIVATA*\n\nDa ora rispondo a tutti i messaggi in questa chat.\nPer disattivare: *${usedPrefix}bot off*`);
    }
    if (args[0]?.toLowerCase() === 'off') {
        botAttivo[chatId] = false;
        return m.reply(`❌ *ℝ𝕃𝕐 𝔹𝕆𝕋 AI DISATTIVATA*\n\nNon risponderò più finché non fai *${usedPrefix}bot on*`);
    }
    if (!args[0]) {
        const stato = botAttivo[chatId]? '🟢 ATTIVA' : '🔴 DISATTIVA';
        return m.reply(`🤖 *ℝ𝕃𝕐 𝔹𝕆𝕋 AI*\nStato: ${stato}\n\nComandi:\n*${usedPrefix}bot on* | Attiva\n*${usedPrefix}bot off* | Disattiva\nCon AI attiva rispondo a tutti i messaggi.`);
    }

    // RISPOSTA IA - SOLO SE ATTIVA
    if (!botAttivo[chatId]) return;

    let userText = text || m.text;
    if (!userText) return;

    // Anti-loop: non rispondere a se stesso e ai comandi
    if (m.isBaileys) return;
    if (userText.startsWith(usedPrefix)) return;

    await conn.sendPresenceUpdate('composing', m.chat);

    try {
        // 1. Prova con SimSimi API gratuita, no key
        let res = await fetch(`https://api.simsimi.net/v2/?text=${encodeURIComponent(userText)}&lc=it`);
        let json = await res.json();
        let reply = json.success || "Non ho capito, puoi ripetere?";

        // 2. Fallback se SimSimi è down
        if (!reply || reply.includes('ERROR')) {
            const risposte = [
                "Mhmm dimmi pure 👑",
                "Ci sono! Cosa vuoi?",
                "Non ho capito bene, spiega meglio",
                "Interessante... continua",
                "Sono qui per te ✨"
            ];
            reply = risposte[Math.floor(Math.random() * risposte.length)];
        }

        await m.reply(reply);

    } catch (e) {
        console.log(e);
        await m.reply("⚠️ Errore connessione IA. Riprova tra un attimo");
    }
}

handler.help = ['bot on/off'];
handler.tags = ['ai'];
handler.command = /^bot$/i;
handler.all = true; // <- IMPORTANTE: ascolta tutti i messaggi

export default handler;