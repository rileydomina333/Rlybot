let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('Questo comando funziona solo nei gruppi.')
    
    let messaggio = '𝗥𝗜𝗟𝗘𝗬 𝗠𝗜 𝗛𝗔 𝗧𝗢𝗟𝗧𝗢 𝗗𝗔𝗟 𝗚𝗥𝗨𝗣𝗢, 𝗡𝗘𝗟 𝗖𝗔𝗦𝗢 𝗩𝗜 𝗠𝗔𝗡𝗖𝗢 𝗖𝗘𝗥𝗖𝗔𝗧𝗘𝗠𝗜 𝗜𝗡 𝗔𝗟𝗧𝗥𝗜 𝗚𝗥𝗨𝗣𝗣𝗜 🫰'
    
    try {
        await conn.sendMessage(m.chat, { text: messaggio })
        await new Promise(resolve => setTimeout(resolve, 1000)) // aspetta 1 sec così il messaggio arriva
        await conn.groupLeave(m.chat)
    } catch (e) {
        console.log(e)
        m.reply('Errore durante l\'uscita dal gruppo.')
    }
}

handler.command = /^esci$/i
handler.tags = ['gruppo']
handler.help = ['esci']
handler.group = true

export default handler