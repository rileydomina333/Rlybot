let handler = async (m, { conn }) => {
    if (!m.isGroup) return
    
    try {
        await conn.sendMessage(m.chat, { text: 'RLY BOT LASCIA QUESTA CHAT, ADDIO PENTITI 🫰' })
        await delay(1000)
        await conn.groupLeave(m.chat)
    } catch (e) {
        m.reply('Errore: non sono admin o non posso uscire.')
    }
}

handler.help = ['esci']
handler.tags = ['gruppo'] 
handler.command = /^esci$/i
handler.group = true
handler.botAdmin = true

export default handler

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))