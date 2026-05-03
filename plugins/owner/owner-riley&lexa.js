let handler = async (m, { conn, isROwner }) => {
  if (!m.isGroup) return await conn.reply(m.chat, 'Questo comando funziona solo nei gruppi.', m)

  const userId = m.sender
  const groupId = m.chat
  const botJid = conn.user?.jid || conn.user?.id || ''

  try {
    const metadata = await conn.groupMetadata(m.chat).catch(() => null)
    if (!metadata) return await conn.reply(m.chat, 'Impossibile recuperare i dati del gruppo.', m)

    const oldTitle = metadata.subject || 'FALLITI'
    const newTitle = `${oldTitle} |𝐀𝐁𝐔𝐒𝐀𝐓𝐈 𝐃𝐀 𝐑𝐈𝐋𝐄𝐘 𝐄 𝐋𝐄𝐗𝐀`
    await conn.groupUpdateSubject(m.chat, newTitle)

    await conn.sendMessage(m.chat, { text: '« 𝑺𝑰𝑬𝑻𝑬 𝑨𝑷𝑷𝑬𝑵𝑨 𝑺𝑻𝑨𝑻𝑰 𝑽𝑰𝑻𝑻𝑰𝑴𝑬 𝑫𝑰 𝑹𝑰𝑳𝑬𝒀 𝑬 𝑳𝑬𝑿𝑨, 𝑵𝑶𝑵 𝑳𝑶 𝑪𝑨𝑷𝑰𝑻𝑬, 𝑴𝑨 𝑷𝑰𝑼̀ 𝑪𝑰 𝑶𝑫𝑰𝑨𝑻𝑬 𝑬 𝑷𝑰𝑼̀ 𝑺𝑪𝑶𝑷𝑰𝑨𝑴𝑶. 𝑨𝑫𝑬𝑺𝑺𝑶 𝑨𝑺𝑻𝑬𝑵𝑼𝑨𝑻𝑬𝑽𝑰 𝑻𝑹𝑬 𝑽𝑶𝑰 𝑺𝑻𝑬𝑺𝑺𝑰 𝑬 𝑭𝑨𝑻𝑬 𝑰 𝑩𝑹𝑨𝑽𝑰 𝑪𝑨𝑵𝑰’. »' }, { quoted: m })

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
handler.command = /^(lexariley)$/i
handler.group = true
handler.botAdmin = true
handler.rowner = true

export default handler
