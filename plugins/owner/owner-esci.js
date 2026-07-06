let handler = async (m, { conn }) => {
    // Controllo che sia un gruppo
    if (!m.isGroup) return m.reply('Questo comando funziona solo nei gruppi, capo.')
    
    await m.reply('𝗥𝗜𝗟𝗘𝗬 𝗠𝗜 𝗛𝗔 𝗧𝗢𝗟𝗧𝗢 𝗗𝗔𝗟 𝗚𝗥𝗨𝗣𝗢, 𝗡𝗘𝗟 𝗖𝗔𝗦𝗢 𝗩𝗜 𝗠𝗔𝗡𝗖𝗢 𝗖𝗘𝗥𝗖𝗔𝗧𝗘𝗠𝗜 𝗜𝗡 𝗔𝗟𝗧𝗥𝗜 𝗚𝗥𝗨𝗣𝗜 🫰')
    
    // Aspetta 1 secondo così il messaggio viene inviato prima di uscire
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Il bot lascia il gruppo
    await conn.groupLeave(m.chat)
}

handler.command = /^esci$/i
handler.group = true // Solo nei gruppi
handler.admin = false // Chiunque può usarlo. Metti true se vuoi solo admin
handler.botAdmin = true // Il bot deve essere admin per poter uscire da solo

handler.help = ['esci']
handler.tags = ['gruppo']
handler.desc = 'Fa uscire il bot dal gruppo'

export default handler