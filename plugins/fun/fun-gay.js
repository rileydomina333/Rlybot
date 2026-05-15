import {
  applyPrideEffect,
  getTargetJid,
  getTargetName,
  getProfileBuffer
} from '../lib/fun-canvas.js'

let handler = async (m, { conn, usedPrefix, command }) => {
  const who = getTargetJid(m)

  if (!who) {
    return m.reply(`*Esempio:* ${usedPrefix + command} @utente`)
  }

  try {
    const buffer = await getProfileBuffer(conn, who)
    const finalBuffer = await applyPrideEffect(buffer, 'gay')

    const nome = await getTargetName(conn, who)

    await conn.sendFile(
      m.chat,
      finalBuffer,
      'gay.jpg',
      `*🏳️‍🌈 @${who.split('@')[0]} (${nome}) è diventato gay*`,
      m,
      false,
      {
        mentions: [who]
      }
    )

  } catch (e) {
    console.error(e)
    m.reply(`*❌ Errore durante l'effetto*`)
  }
}

handler.help = ['gay @utente']
handler.tags = ['fun']
handler.command = /^gay$/i

export default handler
