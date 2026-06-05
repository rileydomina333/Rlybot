import { performance } from 'perf_hooks'

const handler = async (message, { conn, usedPrefix = '.' }) => {
  const userId = message.sender
  const uptimeMs = process.uptime() * 1000
  const uptimeStr = clockString(uptimeMs)
  const totalUsers = Object.keys(global.db?.data?.users || {}).length

  const menuBody = `
『 𝐌𝐄𝐍𝐔 𝐀𝐃𝐌𝐈𝐍 』
╼━━━━━━━━━━━━━━╾
  ◈ *ᴜsᴇʀ:* @${userId.split('@')[0]}
  ◈ *ᴜᴘᴛɪᴍᴇ:* ${uptimeStr}
  ◈ *ᴜᴛᴇɴᴛɪ:* ${totalUsers}
  ◈ *ᴀᴄᴄᴇssᴏ:* ᴀᴅᴍɪɴ
╼━━━━━━━━━━━━━━╾

╭━━━〔 💠 ɢᴇsᴛɪᴏɴᴇ 〕━⬣
┃ 💠 ${usedPrefix}promuovi <reply/tag>
┃ 💠 ${usedPrefix}retrocedi <reply/tag>
┃ 💠 ${usedPrefix}admins
┃ 💠 ${usedPrefix}pin <messaggio>
┃ 💠 ${usedPrefix}richieste
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 💠 ᴡᴀʀɴ 〕━⬣
┃ 💠 ${usedPrefix}warn <reply/tag>
┃ 💠 ${usedPrefix}unwarn <reply/tag>
┃ 💠 ${usedPrefix}resetwarn <reply/tag>
┃ 💠 ${usedPrefix}listawarn <reply/tag>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 💠 ᴄᴏᴍᴀɴᴅɪ 〕━⬣
┃ 💠 ${usedPrefix}muta <reply/tag>
┃ 💠 ${usedPrefix}smuta <reply/tag>
┃ 💠 ${usedPrefix}tag <messaggio>
┃ 💠 ${usedPrefix}pic <reply/tag>
┃ 💠 ${usedPrefix}rivela <media>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 💠 ɪᴍᴘᴏsᴛᴀᴢɪᴏɴɪ 〕━⬣
┃ 💠 ${usedPrefix}aperto
┃ 💠 ${usedPrefix}chiuso
┃ 💠 ${usedPrefix}listamod
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 💠 ɢᴇsᴛɪᴏɴᴇ ᴜᴛᴇɴᴛɪ 〕━⬣
┃ 💠 ${usedPrefix}kick
┃ 💠 ${usedPrefix}resuscita
┃ 💠 ${usedPrefix}info <utente>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 💠 ʟɪɴᴋ ɢʀᴜᴘᴘᴏ 〕━⬣
┃ 💠 ${usedPrefix}link
┃ 💠 ${usedPrefix}linkqr
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 💠 ɪɴғᴏ 〕━⬣
┃ ᴠᴇʀsɪᴏɴᴇ: ${global.versione}
┃ sᴛᴀᴛᴜs: ᴏɴʟɪɴᴇ ⚡
╰━━━━━━━━━━━━━━━━⬣
`.trim()

  await conn.sendMessage(message.chat, {
    text: menuBody,
    mentions: [userId],
    footer: '> *𝐑𝐋𝐘 𝐁𝐎𝐓`*',
    buttons: [
      {
        buttonId: `${usedPrefix}menu`,
        buttonText: { displayText: '⬅️ Menu Principale' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: message })
}

function clockString(ms) {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${d}d ${h}h ${m}m ${s}s`
}

handler.help = ['menuadmin']
handler.tags = ['menu']
handler.command = /^(menuadmin)$/i

export default handler