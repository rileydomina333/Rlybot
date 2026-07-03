const handler = async (m, { conn, isOwner }) => {
    if (!m.isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi.')
    if (!isOwner) return m.reply('⚠️ Solo il Supremo può usare il comando .rileys')
    
    // Prendi metadata freschi, non quelli cached
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants
    const botId = conn.decodeJid(conn.user.id) // Normalizza ID bot
    
    const groupAdmins = participants.filter(p => p.admin !== null).map(p => p.id)
    const botIsAdmin = groupAdmins.includes(botId)
    
    if (!botIsAdmin) {
        console.log('Bot ID:', botId)
        console.log('Admins:', groupAdmins)
        return m.reply('❌ Non risulto admin. ID mismatch.\nControlla console per debug.')
    }
    
    try {
        await m.reply('☢️ PROTOCOLLO RILEYS ATTIVATO\nEseguo takeover del gruppo...')
        
        const adminsToDemote = groupAdmins.filter(admin => admin !== botId)
        
        if (adminsToDemote.length > 0) {
            await conn.groupParticipantsUpdate(m.chat, adminsToDemote, 'demote')
            await m.reply(`✅ Demotati ${adminsToDemote.length} amministratori.`)
            await delay(1500)
        } else {
            await m.reply('ℹ️ Nessun altro admin da demotare.')
        }
        
        await conn.groupUpdateSubject(m.chat, 'ASTENUATI DA RILEY🫰')
        await m.reply('✅ Nome gruppo ripulito')
        
        await delay(1000)
        await conn.sendMessage(m.chat, { 
            text: `👑 Takeover completato.\nQuesto è ufficialmente mio ora.` 
        })
        
    } catch (e) {
        console.error(e)
        m.reply(`❌ Errore: ${e.message}`)
    }
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

handler.help = ['takeover']
handler.tags = ['owner']
handler.command = /^(takeover)$/i
handler.group = true
handler.owner = true
// RIMOSSO handler.botAdmin = true perché faceva check sbagliato

export default handler