import fetch from 'node-fetch';

let botAttivo = global.botAttivo || (global.botAttivo = {});
let chatHistory = global.chatHistory || (global.chatHistory = {});

const PERSONALITA = `Sei ℝ𝕃𝕐 𝔹𝕆𝕋. Rispondi in italiano, diretto, amichevole, max 3 righe.`;

async function chiediALLama(chatId, prompt) {
    let history = chatHistory[chatId] || [];
    let messages = [{ role: "system", content: PERSONALITA }];

    history.slice(-10).forEach(m => messages.push(m));
    messages.push({ role: "user", content: prompt });

    let res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, model: "llama3.1" })
    });

    let reply = await res.text();

    // SALVA MEMORIA
    if(!chatHistory[chatId]) chatHistory[chatId] = [];
    chatHistory[chatId].push({ role: "user", content: prompt });
    chatHistory[chatId].push({ role: "assistant", content: reply });
    if(chatHistory[chatId].length > 20) chatHistory[chatId].splice(0, 2);

    return reply;
}

let handler = async (m, { conn, args, usedPrefix }) => {
    const chatId = m.chat;
    if (args[0]?.toLowerCase() === 'on') {
        botAttivo[chatId] = true;
        return m.reply(`✅ *ℝ𝕃𝕐 𝔹𝕆𝕋 LLAMA ATTIVATA*\n\nModello: Llama 3.1 FREE\nNo Key | Memoria: 10 msg\n*${usedPrefix}bot off* per spegnere`);
    }
    if (args[0]?.toLowerCase() === 'off') {
        botAttivo[chatId] = false;
        return m.reply(`❌ *ℝ𝕃𝕐 𝔹𝕆𝕋 DISATTIVATA*`);
    }
    if (args[0]?.toLowerCase() === 'reset') {
        chatHistory[chatId] = [];
        return m.reply(`🧠 Memoria pulita`);
    }
    if (!args[0]) {
        const stato = botAttivo[chatId]? '🟢 ATTIVA' : '🔴 DISATTIVA';
        return m.reply(`🤖 *ℝ𝕃𝕐 𝔹𝕆𝕋*\nStato: ${stato}\n*${usedPrefix}bot on/off/reset*`);
    }
}

handler.before = async (m, { conn }) => {
    if (!botAttivo[m.chat]) return;
    if (m.isBaileys || m.text.startsWith('.') ||!m.text) return;
    await conn.sendPresenceUpdate('composing', m.chat);
    try {
        let reply = await chiediALLama(m.chat, m.text);
        await conn.reply(m.chat, reply, m);
    } catch (e) {
        await conn.reply(m.chat, "⚠️ Errore server. Riprova", m);
    }
}
handler.help = ['bot on/off/reset'];
handler.tags = ['ai'];
handler.command = /^bot$/i;
export default handler;