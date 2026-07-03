let handler = async (m, { conn, participants }) => {
    if (!m.isGroup) return m.reply('Solo nei gruppi.')

    let user = m.mentionedJid[0]? m.mentionedJid[0] : m.quoted? m.quoted.sender : null
    if (!user) return m.reply('Tagga qualcuno. Es:.dispositivo @utente')

    try {
        // Prendiamo le info del dispositivo dall'ultimo messaggio dell'utente
        let msgs = await conn.loadMessages(m.chat, { limit: 50 })
        let userMsg = msgs.filter(v => v.key.participant === user || v.key.remoteJid === user).pop()

        if (!userMsg) return m.reply('Non trovo messaggi recenti di questo utente.')

        // Baileys salva il device qui
        let device = userMsg.key.id.startsWith('3EB0')? 'iPhone' :
                     userMsg.key.id.startsWith('BAE5')? 'WhatsApp Web' :
                     userMsg.key.id.startsWith('3A')? 'Android' : 'Sconosciuto'

        // Metodo più preciso: prendiamo da messageContextInfo
        let deviceInfo = userMsg.messageContextInfo?.deviceListMetadata?.[0]?.senderDeviceType
        let modello = 'Non disponibile'

        if (deviceInfo === 1) modello = 'Android'
        else if (deviceInfo === 2) modello = 'iPhone'
        else if (deviceInfo === 3) modello = 'WhatsApp Web/Desktop'
        else if (deviceInfo === 4) modello = 'KaiOS'

        // Metodo ancora più preciso se il bot è aggiornato
        let nome = await conn.getName(user)
        let deviceFinale = userMsg.key.id

        // Decodifica ID messaggio per capire il modello
        if (deviceFinale.startsWith('3EB0')) modello = 'iPhone'
        else if (deviceFinale.startsWith('BAE')) modello = 'Android'
        else if (deviceFinale.startsWith('3A')) modello = 'Android'
        else if (deviceFinale.length === 32) modello = 'WhatsApp Web'

        await m.reply(`*Dispositivo di ${nome}*\n\nTipo: ${modello}\nID: \`${deviceFinale.slice(0,4)}...\``)

    } catch (e) {
        console.error(e)
        m.reply('Non riesco a leggere il dispositivo. Serve un messaggio recente dell\'utente.')
    }
}

handler.command = /^dispositivo$/i
handler.tags = ['tools']
handler.help = ['dispositivo @utente']
handler.group = true

export default handler