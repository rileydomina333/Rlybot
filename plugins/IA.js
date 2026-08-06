import fetch from 'node-fetch';

let botAttivo = global.db?.data?.botAttivo || (global.db.data.botAttivo = {});
let chatHistory = global.db?.data?.chatHistory || (global.db.data.chatHistory = {});

async function chiediALLama(chatId, prompt) {
    let history = chatHistory[chatId] || [];
    let messages = [{ role: "system", content: "Sei ℝ𝕃𝕐 𝔹𝕆𝕋. Rispondi in italiano, diretto, amichevole, max 3 righe." }];

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

let handler = async (m, { conn, args, usedPrefix, isBaileys }) => {
    const chatId = m.chat;

    // 1. COMANDI
    if (m.text.startsWith(usedPrefix + 'bot')) {
        if (args[0]?.toLowerCase() === 'on') {
            botAttivo[chatId] = true;
            return m.reply(`✅ *ℝ𝕃𝕐 𝔹𝕆𝕋 LLAMA ATTIVATA*\n\nModello: Llama 3.1 FREE\nNo Key | Memoria: ON\n*${usedPrefix}bot off* per spegnere`);
        }
        if (args[0]?.toLowerCase() === 'off') {
            botAttivo[chatId] = false;
            return m.reply(`❌ *ℝ𝕃𝕐 𝔹𝕆𝕋 DISATTIVATA*`);
        }
        if (args[0]?.toLowerCase() === 'reset') {
            chatHistory[chatId] = [];
            return m.reply(`🧠 Memoria pulita`);
        }
        const stato = botAttivo[chatId]? '🟢 ATTIVA' : '🔴 DISATTIVA';
        return m.reply(`🤖 *ℝ𝕃𝕐 𝔹𝕆𝕋*\nStato: ${stato}\n*${usedPrefix}bot on/off/reset*`);
    }

    // 2. RISPOSTA AUTOMATICA - QUESTA È LA PARTE NUOVA
    if (!botAttivo[chatId]) return;
    if (isBaileys) return;
    if (m.text.startsWith(usedPrefix)) return;
    if (!m.text) return;

    await conn.sendPresenceUpdate('composing', m.chat);

    try {
        let reply = await chiediALLama(chatId, m.text);
        await conn.reply(m.chat, reply, m);
    } catch (e) {
        console.log(e);
        await conn.reply(m.chat, "⚠️ Errore server Pollinations. Riprova tra 5s", m);
    }
}

handler.help = ['bot on/off/reset'];
handler.tags = ['ai'];
handler.command = /.*/; // <- IMPORTANTE: ascolta tutto
handler.priority = 1;

export default handler;