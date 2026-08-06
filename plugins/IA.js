import fetch from 'node-fetch';

let botAttivo = global.botAttivo || (global.botAttivo = {});
const GEMINI_KEY = 'AQ.Ab8RN6IZFlErNXaaHoNHtNOrMwbcyga-
Ept5SzzEs2qfKgNF9w'; // <--- METTI LA TUA KEY QUI

async function chiediAGemini(prompt, history = []) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

    const body = {
        contents: [
            { role: "user", parts: [{ text: "Sei ℝ𝕃𝕐 𝔹𝕆𝕋. Rispondi in italiano, amichevole e diretto. Max 3 righe." }] },
          ...history,
            { role: "user", parts: [{ text: prompt }] }
        ]
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
        return m.reply(`✅ *ℝ𝕃𝕐 𝔹𝕆𝕋 AI GEMINI ATTIVATA*\n\nOra rispondo a tutti i messaggi.\n*${usedPrefix}bot off* per spegnere`);
    }
    if (args[0]?.toLowerCase() === 'off') {
        botAttivo[chatId] = false;
        return m.reply(`❌ *ℝ𝕃𝕐 𝔹𝕆𝕋 AI DISATTIVATA*\n\nNon risponderò più.`);
    }
    if (!args[0]) {
        const stato = botAttivo[chatId]? '🟢 ATTIVA' : '🔴 DISATTIVA';
        return m.reply(`🤖 *ℝ𝕃𝕐 𝔹𝕆𝕋 AI*\nStato: ${stato}\n*${usedPrefix}bot on* | Attiva\n*${usedPrefix}bot off* | Disattiva`);
    }
}

// ASCOLTA TUTTI I MESSAGGI
handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    let text = m.text;
    if (!text) return;

    // REGOLA NUOVA: RISPONDE SOLO SE bot ON
    if (!botAttivo[chatId]) return;

    if (m.isBaileys) return;
    if (text.startsWith('.')) return;

    await conn.sendPresenceUpdate('composing', m.chat);

    try {
        let history = [];
        // Se rispondi al bot gli passo anche il contesto di cosa ha detto lui
        if (m.quoted && m.quoted.sender === conn.user.jid) {
            history.push({ role: "assistant", parts: [{ text: m.quoted.text }] });
        }

        let reply = await chiediAGemini(text, history);
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