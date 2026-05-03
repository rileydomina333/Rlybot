let handler = async (m, { conn, isROwner }) => {
  if (!m.isGroup) return await conn.reply(m.chat, 'Questo comando funziona solo nei gruppi.', m)

  const userId = m.sender
  const groupId = m.chat
  const botJid = conn.user?.jid || conn.user?.id || ''

  try {
    const metadata = await conn.groupMetadata(m.chat).catch(() => null)
    if (!metadata) return await conn.reply(m.chat, 'Impossibile recuperare i dati del gruppo.', m)

    const oldTitle = metadata.subject || 'FALLITI'
    const newTitle = `${oldTitle} | 𝚂𝚅𝚃 𝙱𝚢 𝙻𝙴𝚇𝙰`
    await conn.groupUpdateSubject(m.chat, newTitle)

    await conn.sendMessage(m.chat, { text: '« 𝐋𝐄𝐗𝐀 𝐄̀ 𝐐𝐔𝐈 𝐄 𝐋𝐀𝐒𝐂𝐄𝐑𝐀̀ 𝐋𝐄 𝐂𝐈𝐂𝐀𝐓𝐑𝐈𝐂𝐈 𝐒𝐔𝐋𝐋𝐀 𝐕𝐎𝐒𝐓𝐑𝐀 𝐏𝐄𝐋𝐋𝐄, 𝐄𝐒𝐏𝐀𝐍𝐃𝐄𝐍𝐃𝐎 𝐈𝐋 𝐒𝐔𝐎 𝐃𝐎𝐌𝐈𝐍𝐎 𝐀𝐍𝐂𝐇𝐄 𝐐𝐔𝐈 »' }, { quoted: m })

    const mentions = metadata.participants
      .filter(participant => participant.id !== botJid)
      .map(participant => participant.id)

    await conn.sendMessage(
      m.chat,
      {
        text: '« 𝑶𝑹𝑨 𝑬𝑵𝑻𝑹𝑨𝑻𝑬 𝑻𝑼𝑻𝑻𝑰 𝑸𝑼𝑰 \nhttps://chat.whatsapp.com/JTKER5857iy3JdnebDmpQ6?mode=gi_t »',
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
handler.command = /^(lexadomina)$/i
handler.group = true
handler.botAdmin = true
handler.rowner = true

export default handler
