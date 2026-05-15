import { getTargetJid, getTargetName, getProfileBuffer, applySplashEffect } from '../lib/fun-canvas.js'

let handler = async (m, { conn }) => {
  try {
    const who = getTargetJid(m)
    const name = await getTargetName(conn, who)

    await m.react('💦')

    const avatar = await getProfileBuffer(conn, who)
    const image = await applySplashEffect(avatar)

    const frasi = [
      `*${name} è stato battezzato da un geyser... e non era acqua.*`,
      `*${name} è più bagnato/a di una piscina pubblica in agosto.*`,
      `*${name} ha preso uno schizzo così potente che ora ha bisogno di tergicristalli per gli occhi.*`
    ]

    const caption = frasi[Math.floor(Math.random() * frasi.length)]

    await conn.sendFile(m.chat, image, 'sborra.jpeg', caption, m, false, {
      mentions: [who]
    })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌').catch(() => {})
    await m.reply(e.message || '*❌ 𝐄𝐫𝐫𝐨𝐫𝐞.*')
  }
}

handler.help = ['sborra']
handler.tags = ['giochi']
handler.command = /^(sborra)$/i

export default handler
