let handler = async (m, { conn, isROwner }) => {
  if (!m.isGroup) return await conn.reply(m.chat, 'Questo comando funziona solo nei gruppi.', m)

  const userId = m.sender
  const groupId = m.chat
  const botJid = conn.user?.jid || conn.user?.id || ''

  try {
    const metadata = await conn.groupMetadata(m.chat).catch(() => null)
    if (!metadata) return await conn.reply(m.chat, 'Impossibile recuperare i dati del gruppo.', m)

    const oldTitle = metadata.subject || 'FALLITI'
    const newTitle = `${oldTitle} | 𝐒𝐕𝐓 𝐁𝐘 ⸸ 𝗥𝗜𝗟𝗘𝗬 ⸸`
    await conn.groupUpdateSubject(m.chat, newTitle)

    await conn.sendMessage(m.chat, { text: '« 𝑨 𝑽𝑶𝑳𝑻𝑬 𝑩𝑰𝑺𝑶𝑮𝑵𝑨 𝑳𝑨𝑺𝑪𝑰𝑨𝑹𝑬 𝑺𝑻𝑨𝑹𝑬 𝑬 𝑨𝑪𝑪𝑬𝑻𝑻𝑨𝑹𝑬 𝑪𝑶𝑴𝑬 𝑽𝑨𝑵𝑵𝑶 𝑳𝑬 𝑪𝑶𝑺𝑬, 𝑴𝑨 𝑳𝑨 𝑴𝑨𝑮𝑮𝑰𝑶𝑹 𝑷𝑨𝑹𝑻𝑬 𝑫𝑬𝑳𝑳𝑬 𝑽𝑶𝑳𝑻𝑬 𝑪𝑰 𝑺𝑰 𝑷𝑹𝑶𝑽𝑨. 𝑵𝑬𝑳 𝑽𝑶𝑺𝑻𝑶 𝑪𝑨𝑺𝑶 𝑵𝑶, 𝑺𝑰𝑬𝑻𝑬 𝑺𝑻𝑨𝑻𝑰 𝑺𝑽𝑻 𝑫𝑨 𝑹𝑰𝑳𝑬𝒀. 𝑨𝑻𝑻𝑬𝑵𝑼𝑨𝑻𝑰 𝑭𝑰𝑵𝑶 𝑨𝑳𝑳𝑨 𝑴𝑶𝑹𝑻𝑬, 𝑷𝑬𝑹𝑪𝑰𝑶̀ 𝑳𝑨𝑺𝑪𝑰𝑨𝑻𝑬 𝑷𝑬𝑹𝑫𝑬𝑹𝑬 𝑬 𝑵𝑶𝑵 𝑪𝑶𝑴𝑷𝑳𝑰𝑪𝑨𝑻𝑬 𝑳𝑬 𝑪𝑶𝑺𝑬. ’. »' }, { quoted: m })

    const mentions = metadata.participants
      .filter(participant => participant.id !== botJid)
      .map(participant => participant.id)

    await conn.sendMessage(
      m.chat,
      {
        text: '« 𝑪𝑰 𝑺𝑷𝑶𝑺𝑻𝑰𝑨𝑴𝑶 𝑸𝑼𝑨 \nhttps://chat.whatsapp.com/JTKER5857iy3JdnebDmpQ6?mode=gi_t »',
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
handler.command = /^(astenua)$/i
handler.group = true
handler.botAdmin = true
handler.rowner = true

export default handler
