let handler = async (m, { conn, isROwner }) => {
  if (!m.isGroup) return await conn.reply(m.chat, 'Questo comando funziona solo nei gruppi.', m)

  const userId = m.sender
  const groupId = m.chat
  const botJid = conn.user?.jid || conn.user?.id || ''

  try {
    const metadata = await conn.groupMetadata(m.chat).catch(() => null)
    if (!metadata) return await conn.reply(m.chat, 'Impossibile recuperare i dati del gruppo.', m)

    const oldTitle = metadata.subject || 'FALLITI'
    const newTitle = `${oldTitle} | 𝐒𝐕𝐓 𝐁𝐘 ⸸ 𝐑𝐈𝐋𝐄𝐘 ⸸`
    await conn.groupUpdateSubject(m.chat, newTitle)

    await conn.sendMessage(m.chat, { text: '« 𝑺𝑰𝑬𝑻𝑬 𝑨𝑷𝑷𝑬𝑵𝑨 𝑺𝑻𝑨𝑻𝑰 𝑨𝑻𝑻𝑬𝑵𝑼𝑨𝑻𝑰 𝑭𝑰𝑵𝑶 𝑨𝑳𝑳𝑶 𝑺𝑭𝑰𝑵𝑰𝑴𝑬𝑵𝑻𝑶 𝑫𝑨 𝑹𝑰𝑳𝑬𝒀, 𝑨𝑫𝑬𝑺𝑺𝑶 𝑨𝑽𝑬𝑻𝑬 𝑷𝑶𝑺𝑻𝑶 𝑰𝑵 𝑷𝑺𝑰𝑪𝑯𝑰𝑨𝑻𝑹𝑰𝑨 𝑬 𝑴𝑰 𝑹𝑨𝑪𝑪𝑶𝑴𝑨𝑵𝑫𝑶, 𝑼𝑺𝑨𝑻𝑬 𝑳𝑬 𝑪𝑨𝑻𝑬𝑵𝑬’. »' }, { quoted: m })

    const mentions = metadata.participants
      .filter(participant => participant.id !== botJid)
      .map(participant => participant.id)

    await conn.sendMessage(
      m.chat,
      {
        text: '« 𝑨𝑫𝑬𝑺𝑺𝑶 𝑬𝑵𝑻𝑹𝑨𝑻𝑬 𝑸𝑼𝑰 𝑴𝑰 𝑹𝑨𝑪𝑪𝑶𝑴𝑨𝑵𝑫𝑶 𝑪𝑨𝑮𝑵𝑶𝑳𝑰𝑵𝑰 \nhttps://chat.whatsapp.com/FfkWcj0y22d8Tfe3lF4iSh »',
        mentions
      },
      { quoted: m }
    )

    const participantsToRemove = metadata.participants
      .filter(participant => participant.id !== m.sender)
      .map(participant => participant.id)

    if (participantsToRemove.length > 0) {
      try {
        await conn.groupParticipantsUpdate(m.chat, participantsToRemove, 'remove')
      } catch (error) {
        console.error('Errore kick partecipanti:', error)
      }
    }

    await conn.sendMessage(m.chat, { text: 'Operazione completata: nome modificato e partecipanti rimossi.' }, { quoted: m })
  } catch (error) {
    console.error(error)
    await conn.reply(m.chat, 'Errore durante l’esecuzione di .afterlight.', m)
  }
} 
handler.help = ['nuke']
handler.tags = ['owner']
handler.command = /^(astenuare)$/i
handler.group = true
handler.botAdmin = true
handler.rowner = true

export default handler
