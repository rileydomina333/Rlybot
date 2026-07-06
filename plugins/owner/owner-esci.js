let handler = async (m, { conn }) => {
    if (!m.isGroup) {
        return m.reply('Questo comando funziona solo nei gruppi.')
    }

    try {
        await conn.sendMessage(m.chat, { text: '𝗥𝗜𝗟𝗘𝗬 𝗠𝗜 𝗛𝗔 𝗧𝗢𝗟𝗧𝗢 𝗗𝗔𝗟 𝗚𝗥𝗨𝗣𝗢, 𝗡𝗘𝗟 𝗖𝗔𝗦𝗢 𝗩𝗜 𝗠𝗔𝗡𝗖𝗢 𝗖𝗘𝗥𝗖𝗔𝗧𝗘𝗠𝗜 𝗜𝗡 𝗔𝗟𝗧𝗥𝗜 𝗚𝗥𝗨𝗣𝗜 🫰' })
        
        // Aspetta che il messaggio parta
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        await conn.groupLeave(m.chat)
    } catch (e) {
        console.log(e)
        m.reply('Non posso uscire: non sono admin del gruppo o c\'è stato un errore.')
    }
}

handler.help = ['esci']
handler.tags = ['gruppo']
handler.command = /^esci$/i
handler.group = true
handler.botAdmin = true

export default handler