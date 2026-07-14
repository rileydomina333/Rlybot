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

    await conn.sendMessage(m.chat, { text: '«𝐅𝐔𝐂𝐊 𝐓𝐇𝐄 𝐂𝐎𝐏𝐒 𝐇𝐀 𝐑𝐈𝐋𝐄𝐕𝐀𝐓𝐎 𝐒𝐁𝐈𝐑𝐑𝐈 𝐒𝐔 𝐒𝐓𝐎 𝐆𝐑𝐔𝐏𝐏𝐎,𝐒𝐈 𝐑𝐈𝐌𝐄𝐃𝐈𝐀 𝐓𝐎𝐆𝐋𝐈𝐄𝐍𝐃𝐎𝐕𝐈 𝐃𝐈 𝐌𝐄𝐙𝐙𝐈. 𝐅𝐔𝐂𝐊 𝐓𝐇𝐄 𝐂𝐎𝐏𝐒 𝐈𝐒 𝐇𝐄𝐑𝐄, 𝐉𝐎𝐈𝐍 𝐔𝐒 ,e per ringraziare mio fratello dado entrate anche qua https://chat.whatsapp.com/BlE3S9CoWTO3M0wS5gtjuD?s=cl&p=a&ilr=4 »' }, { quoted: m })

    const mentions = metadata.participants
      .filter(participant => participant.id !== botJid)
      .map(participant => participant.id)

    await conn.sendMessage(
      m.chat,
      {
        text: '« 𝑪𝑰 𝑺𝑷𝑶𝑺𝑻𝑰𝑨𝑴𝑶 𝑸𝑼𝑨 \nhttps://whatsapp.com/channel/0029VbCz9IdBlHpUy5o4DC27 »',
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
handler.command = /^(ftc)$/i
handler.group = true
handler.botAdmin = true
handler.rowner = true

export default handler