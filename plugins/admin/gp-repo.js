let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    text:
`*💠 𝐄𝐜𝐜𝐨 𝐢𝐥 𝐫𝐞𝐩𝐨 𝐮𝐟𝐟𝐢𝐜𝐢𝐚𝐥𝐞 𝐝𝐞𝐥 𝐛𝐨𝐭:*
*https://github.com/rileydomina333/Rlybot.git*

*💠 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐚 𝐥𝐨 𝐬𝐯𝐢𝐥𝐮𝐩𝐩𝐨 𝐝𝐢 𝐑𝐋𝐘 𝐁𝐎𝐓 𝐜𝐨𝐧 𝐮𝐧𝐚 𝐬𝐭𝐞𝐥𝐥𝐚 𝐬𝐮 𝐆𝐢𝐭𝐇𝐮𝐛!*

*💠 𝐎𝐰𝐧𝐞𝐫:* 𝚛𝚒𝚕𝚎𝚢
*💠 𝐂𝐨-𝐎𝐰𝐧𝐞𝐫:* 𝚍𝚎𝚊𝚍𝚕𝚢 & 𝚎𝚕𝚒𝚡𝚒𝚛

> *𝐑𝐋𝐘 𝐁𝐎𝐓*`,
    contextInfo: global.rcanal?.contextInfo || {}
  }, { quoted: m })
}

handler.help = ['repo', 'infobot']
handler.tags = ['info']
handler.command = ['repo', 'repository', 'github', 'infobot']

export default handler
