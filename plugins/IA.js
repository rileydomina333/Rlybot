import fetch from 'node-fetch';

let botAttivo = global.botAttivo || (global.botAttivo = {});
const GEMINI_KEY = 'AQ.Ab8RN6IZFlErNXaaHoNHtNOrMwbcyga-
Ept5SzzEs2qfKgNF9w';

const risposteIA = {
    "ciao": ["Ciao! Come va? 👑", "Ehilà! Dimmi tutto"],
    "default": ["Mhmm", "Dimmi di più", "Interessante"]
};

async function chiediAGemini(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

    const body = {
        contents: [{
            parts: [{ text: `Sei ℝ𝕃𝕐 𝔹𝕆𝕋, un assistente amichevole e un po' sfrontato. Rispondi in italiano, max 2 righe. Domanda: ${prompt}` }]
        }]
    };

    let res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    let json = await res.json();
    return json.candidates[0].content.parts[0].text;
}

let handler = async (m, { conn, text, args, usedPrefix }) => {
    const chatId = m.chat;

    // COMANDI ON/OFF
    if (args[0]?.toLowerCase() === 'on') {
        botAttivo[chatId] = true;
        return m.reply(`✅ *ℝ𝕃𝕐 𝔹𝕆𝕋 AI GEMINI ATTIVATA*\n\nModalità: ONLINE con Gemini 1.5 Flash\n*${usedPrefix}bot off* per spegnere`);
    }
    if (args[0]?.toLowerCase() === 'off') {
        botAttivo[chatId] = false;
        return m.reply(`❌ *ℝ𝕃𝕐 𝔹𝕆𝕋 AI DISATTIVATA*`);
    }
    if (!args[0]) {
        const stato = botAttivo[chatId]? '🟢 ATTIVA' : '🔴 DISATTIVA';
        return m.reply(`🤖 *ℝ𝕃𝕐 𝔹𝕆𝕋 AI*\nStato: ${stato}\n*${usedPrefix}bot on* | Attiva\n*${usedPrefix}bot off* | Disattiva`);
    }
}

// ASCOLTA TUTTI I MESSAGGI
handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    if (!botAttivo[chatId]) return;
    if (m.isBaileys) return;
    if (m.text.startsWith('.')) return;
    if (!m.text) return;

    await conn.sendPresenceUpdate('composing', m.chat);

    try {
        let reply = await chiediAGemini(m.text);
        await conn.reply(m.chat, reply, m);
    } catch (e) {
        console.log(e);
        await conn.reply(m.chat, "⚠️ Errore Gemini. Controlla la key", m);
    }
}

handler.help = ['bot on/off'];
handler.tags = ['ai'];
handler.command = /^bot$/i;

export default handler;