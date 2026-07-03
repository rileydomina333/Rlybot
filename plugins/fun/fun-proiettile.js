let handler = async (m, { conn, participants, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return m.reply('Questo comando funziona solo nei gruppi.')
    if (!isBotAdmin) return m.reply('Non posso sparare: non sono admin del gruppo.')
    if (!isAdmin) return m.reply('Solo gli admin possono usare .proiettile')

    // Prendi tutti i membri tranne il bot e chi ha scritto il comando
    let membri = participants.filter(p => p.id !== conn.user.jid && p.id !== m.sender)
    
    if (membri.length === 0) return m.reply('Non c\'è nessuno da colpire.')
    
    // Scegli una vittima a caso
    let vittima = membri[Math.floor(Math.random() * membri.length)].id
    let nome = await conn.getName(vittima)

    // Messaggio + kick
    await conn.sendMessage(m.chat, { text: `*${nome}* è stato colpito, rimozione istantanea.` }, { quoted: m })
    await conn.groupParticipantsUpdate(m.chat, [vittima], 'remove')
}

handler.command = /^proiettile$/i
handler.tags = ['group']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler