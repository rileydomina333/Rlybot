let handler = async (m, {conn, args, isAdmin, isGroup}) => {
    if(!isGroup) return m.reply('❌ Questo comando funziona solo nei gruppi')

    let user = m.mentionedJid[0] || m.quoted?.sender
    if(!user) return m.reply('Esempio:.report @utente spam\nOppure rispondi al messaggio di uno e fai .segnala motivo')

    let motivo = args.slice(1).join(' ') || m.quoted?.text || 'Nessun motivo'
    if(motivo.length < 3) return m.reply('Scrivi un motivo valido')

    // Prende tutti gli admin del gruppo
    let groupMetadata = await conn.groupMetadata(m.chat)
    let admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id)

    // Messaggio per gli admin
    let reportMsg = `
🚨 *NUOVA SEGNALAZIONE* 🚨

👤 *Segnalato*: @${user.split('@')[0]}
📢 *Segnalato da*: @${m.sender.split('@')[0]}
📍 *Gruppo*: ${groupMetadata.subject}
📝 *Motivo*: ${motivo}
🕐 *Ora*: ${new Date().toLocaleString('it-IT')}

Gli admin controllino.
`.trim()

    // Manda a tutti gli admin in privato + nel gruppo
    for(let admin of admins){
        await conn.sendMessage(admin, {text: reportMsg, mentions: [user, m.sender]})
    }
    await conn.sendMessage(m.chat, {text: reportMsg, mentions: [user, m.sender]})

    // Log locale
    global.db.data.reports = global.db.data.reports || []
    global.db.data.reports.push({
        group: m.chat,
        target: user,
        reporter: m.sender,
        reason: motivo,
        time: Date.now()
    })

    m.reply(`✅ Segnalazione inviata agli admin. Grazie per aver segnalato.`)
}

handler.command = /^segnala$/i
handler.group = true
export default handler