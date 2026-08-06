import fetch from 'node-fetch';

let botAttivo = global.botAttivo || (global.botAttivo = {});
let chatHistory = global.chatHistory || (global.chatHistory = {}); // { chatid: [messaggi] }
const GEMINI_KEY = 'AQ.Ab8RN6IZFlErNXaaHoNHtNOrMwbcyga-
Ept5SzzEs2qfKgNF9w';

const PERSONALITA = `Sei ℝ𝕃𝕐 𝔹𝕆𝕋.
Regole:
1. Rispondi in italiano, diretto, amichevole e con un po' di sass
2. Max 3 righe per risposta
3. Usa emoji solo 1-2 max
4. Ricorda il nome dell'utente se te lo dice
5. Se non sai qualcosa dillo`;

async function chiediAGemini(chatId, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

    // Prendi ultime 10 memorie
    let history = chatHistory[chatId] || [];
    history = history.slice(-10);

    const contents = [
        { role: "user", parts: [{ text: PERSONALITA }] },
       ...history,
        { role: "user", parts: [{ text: prompt }] }
    ];

    let res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
    });

    let json = await res.json();
    if(!json.candidates) throw new Error(JSON.stringify(json));

    let reply = json.candidates[0].content.parts[0].text;

    // SALVA MEMORIA
    if(!chatHistory[chatId]) chatHistory[chatId] = [];
    chatHistory[chatId].push({ role: "user", parts: [{ text: prompt }] });
    chatHistory[chatId].push({ role: "model", parts: [{ text: reply }] });
    if(chatHistory[chatId].length > 20) chatHistory[chatId].splice(0, 2); // tieni solo 10 scambi

    return reply;
}

let handler = async (m, { conn, text, args, usedPrefix }) => {
    const chatId = m.chat;

    if (args[0]?.toLowerCase() === 'on') {
        botAttivo[chatId] = true;
        return m.reply(`✅ *ℝ𝕃𝕐 𝔹𝕆𝕋 PRO ATTIVATA*\n\nModello: Gemini 1.5 Flash\nMemoria: ON 10 messaggi\nRispondo a tutti.\n\n*${usedPrefix}bot off* per spegnere\n*${usedPrefix}bot reset* per pulire memoria`);
    }
    if (args[0]?.toLowerCase() === 'off') {
        botAttivo[chatId] = false;
        return m.reply(`❌ *ℝ𝕃𝕐 𝔹𝕆𝕋 DISATTIVATA*\n\nSono muta.`);
    }
    if (args[0]?.toLowerCase() === 'reset') {
        chatHistory[chatId] = [];
        return m.reply(`🧠 Memoria pulita. Ricominciamo da 0`);
    }
    if (!args[0]) {
        const stato = botAttivo[chatId]? '🟢 ATTIVA' : '🔴 DISATTIVA';
        const mem = chatHistory[chatId]?.length || 0;
        return m.reply(`🤖 *ℝ𝕃𝕐 𝔹𝕆𝕋 PRO*\nStato: ${stato}\nMemoria: ${mem/2} messaggi\n\n*${usedPrefix}bot on*\n*${usedPrefix}bot off*\n*${usedPrefix}bot reset*`);
    }
}

// ASCOLTA TUTTI I MESSAGGI
handler.before = async (m, { conn }) => {
    const chatId = m.chat;
    if (!botAttivo[chatId]) return; // se off = zitto
    if (m.isBaileys) return;
    if (m.text.startsWith('.')) return;
    if (!m.text) return;

    await conn.sendPresenceUpdate('composing', m.chat);
    await new Promise(r => setTimeout(r, 700));

    try {
        let reply = await chiediAGemini(chatId, m.text);
        await conn.reply(m.chat, reply, m);
    } catch (e) {
        console.log(e);
        await conn.reply(m.chat, "⚠️ Errore API. Controlla key o quota", m);
    }
}

handler.help = ['bot on/off/reset'];
handler.tags = ['ai'];
handler.command = /^bot$/i;

export default handler;