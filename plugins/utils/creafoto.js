import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await conn.sendMessage(
      m.chat,
      { text: `⚠️ *Inserisci una descrizione per creare la foto!*\n\n*Esempio:* ${usedPrefix + command} un gatto astronauta nello spazio cyberpunk` },
      { quoted: m }
    )
    return
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    
    const prompt = encodeURIComponent(text)
    const imageUrl = `https://image.pollinations.ai/p/${prompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}&nologo=true`
    
    const response = await fetch(imageUrl)
    if (!response.ok) throw new Error('Errore nel recupero dell\'immagine')
    const buffer = await response.buffer()

    await conn.sendMessage(m.chat, { react: { text: '🎨', key: m.key } })

    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        caption: `✨ *Ecco la tua foto:* _"${text}"_\n\n*Generata da:* @${m.sender.split('@')[0]}`,
        mentions: [m.sender]
      },
      { quoted: m }
    )

  } catch (e) {
    console.error('Errore creafoto:', e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await conn.sendMessage(
      m.chat,
      { text: '❌ *Si è verificato un errore durante la generazione dell\'immagine. Riprova più tardi.*' },
      { quoted: m }
    )
  }
}

handler.help = ['creafoto <descrizione>']
handler.tags = ['tools', 'ai']
handler.command = ['creafoto', 'imagine', 'iafoto']

export default handler
