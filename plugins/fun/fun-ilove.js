import { createILoveImage, getTargetJid, getTargetName } from '../lib/fun-canvas.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const who = getTargetJid(m)

  let name = text?.trim()

  if (who) {
    name = await getTargetName(conn, who)
  }

  if (!name) {
    return m.reply(`*Esempio:* ${usedPrefix + command} @utente`)
  }

  try {
    const buffer = await createILoveImage(name)

    await conn.sendFile(
      m.chat,
      buffer,
      'ilove.jpg',
      `*❤️ I LOVE @${who ? who.split('@')[0] : m.sender.split('@')[0]}*`,
      m,
      false,
      {
        mentions: [who || m.sender]
      }
    )

  } catch (e) {
    console.error(e)
    m.reply(`*❌ Errore durante la creazione immagine*`)
  }
}

handler.help = ['ilove @utente']
handler.tags = ['fun']
handler.command = /^(ilove|il)$/i

export default handler
