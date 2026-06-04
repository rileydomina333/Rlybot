// ╔═══════════════════════════════════════════╗
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎           ║
// ║        Sviluppato da: Elixir              ║
// ║        ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ║
// ╚═══════════════════════════════════════════╝
let handler = async (m, { conn, isOwner }) => {
    try {
        if (!isOwner) {
            return m.reply('*❌ ERRORE*\n━━━━━━━━━━━━━━━━\n\n*⚠️ Motivo:*\n└─⭓ Comando riservato al proprietario\n\n> RLY BOT')
        }
        if (!m.isGroup) {
            return m.reply('*❌ ERRORE*\n━━━━━━━━━━━━━━━━\n\n*⚠️ Motivo:*\n└─⭓ Utilizzabile solo nei gruppi\n\n> RLY BOT')
        }

        // Inizializzazione sicura chat database
        if (!global.db.data.chats) global.db.data.chats = {}
        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

        let chat = global.db.data.chats[m.chat]

        if (!chat.isBanned) {
            return m.reply('*❌ ERRORE*\n━━━━━━━━━━━━━━━━\n\n*⚠️ Motivo:*\n└─⭓ Questo gruppo non è bannato\n\n> RLY BOT')
        }

        chat.isBanned = false
        await global.db.write()

        await m.reply(`*✅ GRUPPO SBANNATO*
━━━━━━━━━━━━━━━━

*📝 Stato:* Sbannato
*👥 Gruppo:* ${await conn.getName(m.chat)}
*🔓 Azione:* Unban accesso bot
*📅 Data:* ${new Date().toLocaleString('it-IT')}

> RLY BOT`)
    } catch (e) {
        console.error('❌ Errore in unbangp:', e)
        await m.reply('*❌ ERRORE*\n━━━━━━━━━━━━━━━━\n\n*⚠️ Si è verificato un errore*\n\n> RLY BOT').catch(() => {})
    }
}

handler.help = ['unbangp']
handler.tags = ['creatore']
handler.command = /^unbangp$/i
handler.rowner = true
handler.group = true

export default handler
