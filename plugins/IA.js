let botAttivo = {}

let handler = async (m, {conn, args, usedPrefix}) => {
    let chat = m.chat
    if (args[0] == 'on') {
        botAttivo[chat] = true
        return m.reply(`✅ *ℝ𝕃𝕐 𝔹𝕆𝕋 AI ON*\nOra rispondo a tutti i messaggi`)
    }
    if (args[0] == 'off') {
        botAttivo[chat] = false
        return m.reply(`❌ *BOT OFF*\nNon rispondo più`)
    }
    if (args[0] == 'reset') {
        chatHistory[chat] = []
        return m.reply(`🧠 Memoria pulita`)
    }
    let stato = botAttivo[chat]? '🟢 ON' : '🔴 OFF'
    m.reply(`*Stato AI:* ${stato}\n*.bot on* per attivare\n*.bot off* per disattivare`)
}
handler.help = ['bot']
handler.tags = ['ai']
handler.command = /^bot$/i
export default handler