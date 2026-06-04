let handler = m => m
handler.before = async function (m, {conn, isAdmin, isBotAdmin, isOwner, isROwner}) {
    if (!m.isGroup) return !1
    let chat = global.db.data.chats[m.chat]
    let bot = global.db.data.settings[conn.user.jid] || {}

    if (chat?.antipaki && !isAdmin && !isOwner && !isROwner) {
        if (m.text && /pakistan|paki|pakistano/i.test(m.text)) {
            if (isBotAdmin) {
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {})
            }
        }
    }
}
export default handler
