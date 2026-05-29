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

  const prompt = encodeURIComponent(text)
  const providers = [
    `https://image.pollinations.ai/p/${prompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}&nologo=true`,
    `https://api.scrapi.download/ai/text2img?prompt=${prompt}`,
    `https://api.xyroinee.xyz/api/ai/text2img?q=${prompt}`
  ]

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  for (let url of providers) {
    try {
      const response = await fetch(url)
      if (!response.ok) continue
      
      const buffer = await response.buffer()
      if (buffer.length < 1000) continue 

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
      return 
    } catch {
      continue
    }
  }

  await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
}

handler.help = ['creafoto <descrizione>']
handler.tags = ['tools', 'ai']
handler.command = ['creafoto', 'imagine', 'iafoto']

export default handler
