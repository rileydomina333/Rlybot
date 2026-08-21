let handler = async (m, { conn, isROwner }) => {
  if (!m.isGroup) return await conn.reply(m.chat, 'Questo comando funziona solo nei gruppi.', m)

  const userId = m.sender
  const groupId = m.chat
  const botJid = conn.user?.jid || conn.user?.id || ''

  try {
    const metadata = await conn.groupMetadata(m.chat).catch(() => null)
    if (!metadata) return await conn.reply(m.chat, 'Impossibile recuperare i dati del gruppo.', m)

    const oldTitle = metadata.subject || 'FALLITI'
    const newTitle = `${oldTitle} | 𝐍𝐔𝐊𝐄𝐃 𝐁𝐘 𝗥𝗜𝗟𝗘𝗬`
    await conn.groupUpdateSubject(m.chat, newTitle)

    await conn.sendMessage(m.chat, { text: '«𝐀𝐯𝐞𝐭𝐞 𝐚𝐯𝐮𝐭𝐨 𝐥'𝐨𝐧𝐨𝐫𝐞 𝐝𝐢 𝐞𝐬𝐬𝐞𝐫𝐞 𝐬𝐭𝐚𝐭𝐢 𝐬𝐯𝐭 𝐝𝐚 𝐫𝐢𝐥𝐞𝐲, 𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨 𝐝𝐢 𝐦𝐞𝐫𝐝𝐚 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐝𝐨𝐦𝐢𝐧𝐚𝐭𝐨, 𝐜𝐨𝐦𝐞 𝐨𝐠𝐧𝐢 𝐮𝐧𝐨 𝐝𝐢 𝐯𝐨𝐢. 𝐎𝐫𝐚 𝐚𝐯𝐞𝐭𝐞 𝐢𝐥 𝐝𝐢𝐫𝐢𝐭𝐭𝐨 𝐝𝐢 𝐬𝐭𝐚𝐫𝐞 𝐳𝐢𝐭𝐭𝐢 𝐞 𝐬𝐮𝐛𝐢𝐫𝐞 𝐝𝐚 𝐛𝐫𝐚𝐯𝐢 𝐜𝐚𝐧𝐢»' }, { quoted: m })

    const mentions = metadata.participants
      .filter(participant => participant.id !== botJid)
      .map(participant => participant.id)

    await conn.sendMessage(
      m.chat,
      {
        text: '« 𝐄𝐍𝐓𝐑𝐀𝐓𝐄 𝐐𝐔𝐀 nhttps://whatsapp.com/channel/0029Vb8MFbz545umL8M71r02 »',
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