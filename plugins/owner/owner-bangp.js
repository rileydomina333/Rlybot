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

        if (chat.isBanned) {
            return m.reply('*❌ ERRORE*\n━━━━━━━━━━━━━━━━\n\n*⚠️ Motivo:*\n└─⭓ Questo gruppo è già bannato\n\n> RLY BOT')
        }

        chat.isBanned = true
        await global.db.write()

        let groupInfo = await conn.groupMetadata(m.chat).catch(() => null)
        let memberCount = groupInfo ? groupInfo.participants.length : '?'
        let adminCount = groupInfo ? groupInfo.participants.filter(p => p.admin).length : '?'

        await m.reply(`*🚫 GRUPPO BANNATO*
━━━━━━━━━━━━━━━━

*📝 Stato:* Bannato
*👥 Gruppo:* ${await conn.getName(m.chat)}
*👤 Membri:* ${memberCount}
*👑 Admin:* ${adminCount}
*🔒 Azione:* Ban accesso bot
*📅 Data:* ${new Date().toLocaleString('it-IT')}

*⚠️ Effetti:*
┌─⭓ Bot non risponde ai comandi
├─⭓ Solo owner possono usare il bot
└─⭓ Ban attivo fino a revoca

> RLY BOT`)

        // Notifica admin del gruppo
        if (groupInfo) {
            let admins = groupInfo.participants.filter(p => p.admin)
            let adminMsg = `*⚠️ NOTIFICA ADMIN*\n━━━━━━━━━━━━━━━━\n\n*📝 Info:*\n└─⭓ Questo gruppo è stato bannato\n\n*📌 Note:*\n└─⭓ Il bot non risponderà ai comandi\n\n> RLY BOT`
            for (let admin of admins) {
                await conn.sendMessage(admin.id, { text: adminMsg }).catch(() => {})
            }
        }
    } catch (e) {
        console.error('❌ Errore in bangp:', e)
        await m.reply('*❌ ERRORE*\n━━━━━━━━━━━━━━━━\n\n*⚠️ Si è verificato un errore*\n\n> RLY BOT').catch(() => {})
    }
}

handler.help = ['bangp']
handler.tags = ['creatore']
handler.command = /^bangp$/i
handler.rowner = true
handler.group = true

export default handler
