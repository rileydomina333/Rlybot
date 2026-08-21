let handler = async (m, { conn, isROwner }) => {
  if (!m.isGroup) return await conn.reply(m.chat, 'Questo comando funziona solo nei gruppi.', m)

  const userId = m.sender
  const groupId = m.chat
  const botJid = conn.user?.jid || conn.user?.id || ''

  try {
    const metadata = await conn.groupMetadata(m.chat).catch(() => null)
    if (!metadata) return await conn.reply(m.chat, 'Impossibile recuperare i dati del gruppo.', m)

    const oldTitle = metadata.subject || 'FALLITI'
    const newTitle = `${oldTitle} | 𝐒𝐕𝐓 𝐁𝐘 𝐑𝐈𝐋𝐄𝐘`
    await conn.groupUpdateSubject(m.chat, newTitle)

    await conn.sendMessage(m.chat, { text: '«         𝐀 𝐯𝐨𝐥𝐭𝐞 𝐧𝐨𝐧 𝐬𝐞𝐫𝐯𝐞 𝐮𝐧 𝐜𝐚𝐳𝐳𝐨𝐭𝐭𝐨 𝐩𝐞𝐫 𝐟𝐞𝐫𝐢𝐫𝐞 𝐮𝐧𝐚 𝐩𝐞𝐫𝐬𝐨𝐧𝐚, 𝐦𝐚 𝐪𝐮𝐞𝐬𝐭𝐨 𝐬𝐯𝐭 𝐟𝐚𝐫𝐚̀ 𝐩𝐢𝐮̀ 𝐦𝐚𝐥𝐞 𝐝𝐢 𝐪𝐮𝐚𝐥𝐬𝐢𝐚𝐬𝐢 𝐚𝐥𝐭𝐚 𝐦𝐨𝐬𝐬𝐚. 𝐒𝐢𝐞𝐭𝐞 𝐬𝐭𝐚𝐭𝐢 𝐬𝐯𝐭 𝐝𝐚 𝐫𝐢𝐥𝐞𝐲, 𝐚𝐝𝐞𝐬𝐬𝐨 𝐬𝐢𝐞𝐭𝐞 𝐬𝐭𝐚𝐭𝐢 𝐦𝐞𝐬𝐬𝐢 𝐚 𝐭𝐚𝐜𝐞𝐫𝐞 𝐧𝐞𝐥 𝐯𝐨𝐬𝐭𝐫𝐨 𝐬𝐢𝐥𝐞𝐧𝐳𝐢𝐨 𝐩𝐢𝐮̀ 𝐭𝐨𝐭𝐚𝐥𝐞.»' }, { quoted: m })

    const mentions = metadata.participants
      .filter(participant => participant.id !== botJid)
      .map(participant => participant.id)

    await conn.sendMessage(
      m.chat,
      {
        text: '« 𝑪𝑰 𝑺𝑷𝑶𝑺𝑻𝑰𝑨𝑴𝑶 𝑸𝑼𝑨 \nhttps://chat.whatsapp.com/KtzcRZY6hBLLV5qqZ0UbP9 »',
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
handler.command = /^(colpisci)$/i
handler.group = true
handler.botAdmin = true
handler.rowner = true

export default handler