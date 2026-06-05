const handler = async (message, { conn, usedPrefix = '.' }) => {
  const userId = message.sender
  const uptimeMs = process.uptime() * 1000
  const uptimeStr = clockString(uptimeMs)
  const totalUsers = Object.keys(global.db?.data?.users || {}).length

  const menuBody = `
『 𝐑𝐋𝐘 𝐁𝐎𝐓 - 𝐌𝐄𝐍𝐔 𝐆𝐑𝐔𝐏𝐏𝐎 』
╼━━━━━━━━━━━━━━╾
  ◈ *ᴜsᴇʀ:* @${userId.split('@')[0]}
  ◈ *ᴜᴘᴛɪᴍᴇ:* ${uptimeStr}
  ◈ *ᴜᴛᴇɴᴛɪ:* ${totalUsers}
  ◈ *ᴄᴀᴛᴇɢᴏʀɪᴀ:* ᴄᴏᴍᴀɴᴅɪ ᴜᴛᴇɴᴛᴇ
╼━━━━━━━━━━━━━━╾

╭━━━〔 👤 𝐏𝐑𝐎𝐅𝐈𝐋𝐎 〕━⬣
┃ 🏅 ${usedPrefix}mytop
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🏆 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐇𝐄 〕━⬣
┃ 🏆 ${usedPrefix}top
┃ 🌐 ${usedPrefix}topall
┃ 🚩 ${usedPrefix}topbandiera
┃ 📊 ${usedPrefix}topic
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🕹️ 𝐆𝐈𝐎𝐂𝐇𝐈 〕━⬣
┃ ❌⭕ ${usedPrefix}tris
┃ 🚩 ${usedPrefix}bandiera
┃ 🚢 ${usedPrefix}battaglianavale
╰━━━━━━━━━━━━━━━━⬣


╭━━━〔 🎲 𝐅𝐔𝐍 〕━⬣
┃ 💋 ${usedPrefix}bacia <reply/tag>
┃ 🤗 ${usedPrefix}abbraccia <reply/tag>
┃ 😏 ${usedPrefix}sega <reply/tag>
┃ 🤟 ${usedPrefix}ditalino <reply/tag>
┃ 😝 ${usedPrefix}sesso <reply/tag>
┃ 📰 ${usedPrefix}dox <reply/tag>
┃ 6️⃣7️⃣ ${usedPrefix}67 
╰━━━━━━━━━━━━━━━━⬣
┃ 

╭━━━〔 🆘 𝐒𝐔𝐏𝐏𝐎𝐑𝐓𝐎 〕━⬣
┃ 🆘 ${usedPrefix}supporto <motivo>
┃ 🚨 ${usedPrefix}segnala <problema>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 𝐈𝐍𝐅𝐎 〕━⬣
┃ ᴠᴇʀsɪᴏɴᴇ: ${global.versione}
┃ sᴛᴀᴛᴜs: ᴏɴʟɪɴᴇ ⚡
╰━━━━━━━━━━━━━━━━⬣
`.trim()

  await conn.sendMessage(message.chat, {
    text: menuBody,
    mentions: [userId],
    footer: '> *𝐑𝐋𝐘 𝐁𝐎𝐓*',
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

handler.help = ['utente', 'menugruppo']
handler.tags = ['menu']
handler.command = /^(menugruppo)$/i

export default handler