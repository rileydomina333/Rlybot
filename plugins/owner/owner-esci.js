let handler = async (m, { conn }) => {
    // Controllo base senza usare isAdmin/isOwner che a volte sono undefined
    if (!m.chat.endsWith('@g.us')) return m.reply('Solo nei gruppi.')
    
    const messaggio = '𝗥𝗜𝗟𝗘𝗬 𝗠𝗜 𝗛𝗔 𝗧𝗢𝗟𝗧𝗢 𝗗𝗔𝗟 𝗚𝗥𝗨𝗣𝗢, 𝗡𝗘𝗟 𝗖𝗔𝗦𝗢 𝗩𝗜 𝗠𝗔𝗡𝗖𝗢 𝗖𝗘𝗥𝗖𝗔𝗧𝗘𝗠𝗜 𝗜𝗡 𝗔𝗟𝗧𝗥𝗜 𝗚𝗥𝗨𝗣𝗜 🫰'
    
    try {
        await conn.sendMessage(m.chat, { text: messaggio }, { quoted: m })
        await new Promise(r => setTimeout(r, 1500)) // 1.5 sec per sicurezza
        await conn.groupLeave(m.chat)
    } catch (e) {
        console.error('Errore .esci:', e)
        await m.reply('Non riesco ad uscire dal gruppo.')
    }
}

handler.command = /^esci$/i
handler.help = ['esci']
handler.tags = ['gruppo']

export default handler