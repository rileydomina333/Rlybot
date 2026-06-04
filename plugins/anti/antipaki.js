@@ -3,6 +3,10 @@
let handler = m => m
handler.before = async function (m, {conn, isAdmin, isBotAdmin, isOwner, isROwner}) {
    if (!m.isGroup) return !1
    let chat = global.db.data.chats[m.chat]
    let bot = global.db.data.settings[conn.user.jid] || {}

@@ -13,4 +17,4 @@ handler.before = async function (m, {conn, isAdmin, isBotAdmin, isOwner, isROwne
        }
    }
}
export default handler;
