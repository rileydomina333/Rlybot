import fetch from 'node-fetch';

let botAttivo = {}; // memoria semplice

async function chiediALLama(prompt) {
    let res = await fetch('https://text.pollinations.ai/' + encodeURIComponent(prompt) + '?model=llama3.1');
    let reply = await res.text();
    return reply;
}

let handler = async (m, { conn, args, usedPrefix }) => {
    const chatId = m.chat;

    if (m.text === usedPrefix + 'bot on') {
        botAttivo[chatId] = true;
        return m.reply(`✅ BOT ATTIVATO\nOra rispondo a tutto`);
    }
    if (m.text === usedPrefix + 'bot off') {
        botAttivo[chatId] = false;
        return m.reply(`❌ BOT DISATTIVATO`);
    }
    if (m.text === usedPrefix + 'bot') {
        return m.reply(`Stato: ${botAttivo[chatId]? 'ON' : 'OFF'}`);
    }

    // AUTO REPLY
    if (!botAttivo[chatId]) return;
    if (m.isBaileys) return;
    if (m.text.startsWith(usedPrefix)) return;

    await conn.sendPresenceUpdate('composing', m.chat);

    try {
        let reply = await chiediALLama(m.text);
        await conn.reply(m.chat, reply, m);
    } catch (e) {
        console.log("ERRORE AI:", e)
        await m.reply("Errore: " + e.message);
    }
}

handler.command = /.*/;
handler.before = () => {}
export default handler;