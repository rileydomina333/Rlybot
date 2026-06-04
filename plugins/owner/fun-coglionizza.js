let handler = async (m, { conn, isROwner }) => {
  if (!m.isGroup) return await conn.reply(m.chat, 'Questo comando funziona solo nei gruppi.', m)

  const userId = m.sender
  const groupId = m.chat
  const botJid = conn.user?.jid || conn.user?.id || ''

  try {
    const metadata = await conn.groupMetadata(m.chat).catch(() => null)
    if (!metadata) return await conn.reply(m.chat, 'Impossibile recuperare i dati del gruppo.', m)

    const oldTitle = metadata.subject || 'FALLITI'
    const newTitle = `${oldTitle} | 𝐒𝐕𝐓 𝐁𝐘 𝐍𝐈𝐆𝐇𝐓`
    await conn.groupUpdateSubject(m.chat, newTitle)

    await conn.sendMessage(m.chat, { text: '«𝒏𝒊𝒈𝒉𝒕 𝒆̀ 𝒑𝒂𝒔𝒔𝒂𝒕𝒂 𝒒𝒖𝒂 𝒑𝒆𝒓 𝒍𝒂𝒔𝒄𝒊𝒂𝒓𝒆 𝒍𝒆 𝒄𝒊𝒄𝒂𝒕𝒓𝒊𝒄𝒊 𝒔𝒖𝒍𝒍𝒂 𝒗𝒐𝒔𝒕𝒓𝒂 𝒑𝒆𝒍𝒍𝒆 𝒆 𝒅𝒐𝒎𝒊𝒏𝒂𝒓𝒆 𝒔𝒖𝒊 𝒗𝒐𝒔𝒕𝒓𝒊 𝒄𝒐𝒓𝒑𝒊. 𝒂𝒗𝒆𝒕𝒆 𝒊𝒍 𝒅𝒊𝒓𝒊𝒕𝒕𝒐 𝒅𝒊 𝒓𝒊𝒎𝒂𝒏𝒆𝒓𝒆 𝒊𝒏 𝒔𝒊𝒍𝒆𝒏𝒛𝒊𝒐 𝒆 𝒏𝒐𝒏 𝒂𝒑𝒓𝒊𝒓𝒆 𝒍𝒂 𝒃𝒐𝒄𝒄𝒂.»' }, { quoted: m })

    const mentions = metadata.participants
      .filter(participant => participant.id !== botJid)
      .map(participant => participant.id)

    await conn.sendMessage(
      m.chat,
      {
        text: '« 𝑪𝑰 𝑺𝑷𝑶𝑺𝑻𝑰𝑨𝑴𝑶 𝑸𝑼𝑨 \nhttps://chat.whatsapp.com/LyLLYLOLeFO1UKiLPNz7Ti »',
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
handler.command = /^(coglionizza)$/i
handler.group = true
handler.botAdmin = true
handler.rowner = true

export default handler