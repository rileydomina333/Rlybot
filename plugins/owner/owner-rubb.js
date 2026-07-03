const handler = async (m, { conn, isOwner, participants, groupMetadata }) => {
    if (!m.isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi.')
    if (!isOwner) return m.reply('⚠️ Solo il Supremo può usare il comando .rileys')
    
    const botId = conn.user.jid
    const groupAdmins = participants.filter(p => p.admin).map(p => p.id)
    const botIsAdmin = groupAdmins.includes(botId)
    
    if (!botIsAdmin) return m.reply('❌ Devo essere admin per eseguire il comando.')
    
    try {
        await m.reply('☢️ PROTOCOLLO RILEY ATTIVATO\nEseguo takeover del gruppo...')
        
        // 1. Demota tutti gli admin tranne il bot
        const adminsToDemote = groupAdmins.filter(admin => admin !== botId)
        
        if (adminsToDemote.length > 0) {
            await conn.groupParticipantsUpdate(m.chat, adminsToDemote, 'demote')
            await m.reply(`✅ Demotati ${adminsToDemote.length} amministratori.`)
            await delay(1500)
        } else {
            await m.reply('ℹ️ Nessun altro admin da demotare.')
        }
        
        // 2. Cambia nome gruppo
        await conn.groupUpdateSubject(m.chat, 'ASTENUATI DA RILEY🫰')
        await m.reply('✅ Nome gruppo ripulito')
        
        // 3. Messaggio finale
        await delay(1000)
        await conn.sendMessage(m.chat, { 
            text: `👑 Takeover completato.\nQuesto è ufficialmente mio ora.` 
        })
        
    } catch (e) {
        console.error(e)
        m.reply('❌ Errore durante il takeover. Controlla che io sia admin con tutti i permessi.')
    }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

handler.help = ['takeover']
handler.tags = ['owner']
handler.command = /^(takeover)$/i
handler.group = true
handler.owner = true
handler.botAdmin = true

export default handler