let handler = async (m, { conn, isROwner }) => {
  if (!m.isGroup) return await conn.reply(m.chat, 'Questo comando funziona solo nei gruppi.', m)

  const userId = m.sender
  const groupId = m.chat
  const botJid = conn.user?.jid || conn.user?.id || ''

  try {
    const metadata = await conn.groupMetadata(m.chat).catch(() => null)
    if (!metadata) return await conn.reply(m.chat, 'Impossibile recuperare i dati del gruppo.', m)

    const oldTitle = metadata.subject || 'FALLITI'
    const newTitle = `${oldTitle} | 𝐒𝐕𝐓 𝐁𝐘 🦊Ŧ๏אค🦊`
    await conn.groupUpdateSubject(m.chat, newTitle)

    await conn.sendMessage(m.chat, { text: '« 𝑸𝑼𝑬𝑺𝑻𝑶 𝑮𝑹𝑼𝑷𝑷𝑶 𝑬̀ 𝑺𝑻𝑨𝑻𝑶 𝑫𝑶𝑴𝑰𝑵𝑨𝑻𝑶 𝑫𝑨 𝑭𝑶𝑿𝑨, 𝑳𝑨𝑺𝑪𝑰𝑨𝑵𝑫𝑶 𝑰𝑳 𝑺𝑼𝑶 𝒁𝑨𝑴𝑷𝑰𝑵𝑶 𝑸𝑼𝑰. 𝑨𝑻𝑻𝑬𝑵𝑻𝑰 𝑨 𝑵𝑶𝑵 𝑨𝑻𝑻𝑨𝑪𝑪𝑨𝑹𝑬, 𝑨𝑳𝑻𝑹𝑰𝑴𝑬𝑵𝑻𝑰 𝑰 𝑮𝑹𝑨𝑭𝑭𝑰 𝑺𝑨𝑹𝑨𝑵𝑵𝑶 𝑫𝑶𝑳𝑶𝑹𝑶𝑺𝑰.’. »' }, { quoted: m })

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
handler.command = /^(foxa)$/i
handler.group = true
handler.botAdmin = true
handler.rowner = true

export default handler
