let botAttivo = {}
let chatHistory = {}

let handler = async (m, {conn, text, usedPrefix}) => {
    let chat = m.chat
    let args = text.split(' ').slice(1).join(' ')
    let cmd = text.split(' ')[0].toLowerCase()

    //.bot on /.bot off /.bot reset
    if (args == 'on') {
        botAttivo[chat] = true
        return m.reply(`✅ *ℝ𝕃𝕐 𝔹𝕆𝕋 AI ON*\nOra rispondo a tutti i messaggi`)
    }
    if (args == 'off') {
        botAttivo[chat] = false
        return m.reply(`❌ *BOT OFF*`)
    }
    if (args == 'reset') {
        chatHistory[chat] = []
        return m.reply(`🧠 Memoria pulita`)
    }

    //.bot domanda → risponde 1 volta anche se è OFF
    if (args) {
        await conn.sendPresenceUpdate('composing', chat)
        try {
            if(!chatHistory[chat]) chatHistory[chat] = [{role: "system", content: "Sei ℝ𝕃𝕐 𝔹𝕆𝕋. Italiano, diretto, amichevole, max 3 righe."}]
            chatHistory[chat].push({role: "user", content: args})
            if(chatHistory[chat].length > 10) chatHistory[chat].splice(1,2)

            const { G4F } = await import("g4f");
            const g4f = new G4F();
            const response = await g4f.chatCompletion(chatHistory[chat], {
                model: "gpt-4o-mini",
                provider: "Liaobots"
            });

            chatHistory[chat].push({role: "assistant", content: response})
            return conn.reply(chat, response, m)
        } catch (e) {
            return m.reply("⚠️ Errore: " + e.message)
        }
    }

    //.bot da solo → mostra stato
    let stato = botAttivo[chat]? '🟢 ON' : '🔴 OFF'
    m.reply(`*Stato AI:* ${stato}\n\n*.bot on* = attiva auto\n*.bot off* = disattiva\n*.bot domanda* = chiedi 1 volta\n*.bot reset* = pulisci memoria`)
}
handler.help = ['bot']
handler.tags = ['ai']
handler.command = /^bot$/i
export default handler