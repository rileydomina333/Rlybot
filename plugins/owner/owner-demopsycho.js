let handler = async (m, { conn, isROwner }) => {
  if (!m.isGroup) return await conn.reply(m.chat, 'Questo comando funziona solo nei gruppi.', m)

  const userId = m.sender
  const groupId = m.chat
  const botJid = conn.user?.jid || conn.user?.id || ''

  try {
    const metadata = await conn.groupMetadata(m.chat).catch(() => null)
    if (!metadata) return await conn.reply(m.chat, 'Impossibile recuperare i dati del gruppo.', m)

    const oldTitle = metadata.subject || 'FALLITI'
    const newTitle = `${oldTitle} | 𝚂𝚅𝚃 𝙱𝚈 ⸸ 𝐕𝐄𝐍𝐎𝐌 ⸸`
    await conn.groupUpdateSubject(m.chat, newTitle)

    await conn.sendMessage(m.chat, { text: '« 𝑽𝑬𝑵𝑶𝑴 𝑬̀ 𝑷𝑨𝑺𝑺𝑨𝑻𝑶 𝑸𝑼𝑰 𝑨 𝑬𝑺𝑶𝑹𝑪𝑰𝒁𝒁𝑨𝑹𝑬 𝑻𝑼𝑻𝑻𝑰 𝑽𝑶𝑰, 𝑷𝑬𝑹𝑪𝑯𝑬́ 𝑵𝑶𝑵 𝑺𝑰𝑬𝑻𝑬 𝑺𝑻𝑨𝑻𝑰 𝑰𝑵 𝑮𝑹𝑨𝑫𝑶 𝑫𝑰 𝑬𝑺𝑺𝑬𝑹𝑬 𝑫𝑬𝑴𝑶𝑵𝑰.’. »' }, { quoted: m })

    const mentions = metadata.participants
      .filter(participant => participant.id !== botJid)
      .map(participant => participant.id)

    await conn.sendMessage(
      m.chat,
      {
        text: '« 𝑨𝑫𝑬𝑺𝑺𝑶 𝑪𝑯𝑰𝑵𝑨𝑻𝑬𝑽𝑰 𝑨𝑳 𝑽𝑶𝑺𝑻𝑹𝑶 𝑫𝑬𝑴𝑶𝑵𝑬 𝑭𝑶𝑵𝑫𝑨𝑻𝑶𝑹𝑬, 𝑪𝑶𝑳𝑼𝑰 𝑪𝑯𝑬 𝑽𝑰 𝑯𝑨 𝑪𝑹𝑬𝑨𝑻𝑶 𝑬 𝑺𝑻𝑨𝑻𝑬 𝑰𝑵 𝑺𝑰𝑳𝑬𝑵𝒁𝑰𝑶.»',
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
handler.command = /^(esorcizza)$/i
handler.group = true
handler.botAdmin = true
handler.rowner = true

export default handler
