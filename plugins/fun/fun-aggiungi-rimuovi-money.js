//add-remove money by Bonzink

let handler = async (m, { conn, args, command, usedPrefix }) => {
  const isAdd = /^addmoney$/i.test(command)
  const isRemove = /^removemoney$/i.test(command)

  const target = getTarget(m, args)
  const amountText = getAmountText(m, args)

  if (!target) {
    return m.reply(
      box(
        '💸',
        '𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 𝐒𝐎𝐋𝐃𝐈',
        `*📌 𝐔𝐬𝐨:*
*${usedPrefix}${command} @utente 1000*
*${usedPrefix}${command} 393xxxxxxxxx 1.000*
*${usedPrefix}${command} 1000*

*📌 𝐏𝐮𝐨𝐢 𝐮𝐬𝐚𝐫𝐞 𝐚𝐧𝐜𝐡𝐞 𝐢𝐥 𝐫𝐞𝐩𝐥𝐲.*
*📌 𝐏𝐞𝐫 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞 𝐭𝐮𝐭𝐭𝐨:*
*${usedPrefix}removemoney @utente tutti*`
      )
    )
  }

  global.db.data.users[target] ??= {}

  const user = global.db.data.users[target]

  if (typeof user.euro !== 'number') user.euro = 0
  if (typeof user.bank !== 'number') user.bank = 0

  let amount

  if (isRemove && /^(tutti|tutto|all)$/i.test(amountText || '')) {
    amount = user.euro
  } else {
    amount = parseMoney(amountText)
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    return m.reply(
      box(
        '❌',
        '𝐐𝐔𝐀𝐍𝐓𝐈𝐓À 𝐍𝐎𝐍 𝐕𝐀𝐋𝐈𝐃𝐀',
        `*📌 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧𝐚 𝐜𝐢𝐟𝐫𝐚 𝐯𝐚𝐥𝐢𝐝𝐚.*

*𝐄𝐬𝐞𝐦𝐩𝐢:*
*${usedPrefix}${command} @utente 1000*
*${usedPrefix}${command} @utente 1.000*
*${usedPrefix}${command} @utente 1 000*`
      )
    )
  }

  if (isAdd) {
    user.euro += amount

    return conn.sendMessage(
      m.chat,
      {
        text: box(
          '✅',
          '𝐒𝐎𝐋𝐃𝐈 𝐀𝐆𝐆𝐈𝐔𝐍𝐓𝐈',
          `*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* @${target.split('@')[0]}

*💸 𝐀𝐠𝐠𝐢𝐮𝐧𝐭𝐢:* ${formatNumber(amount)}
*💼 𝐂𝐨𝐧𝐭𝐚𝐧𝐭𝐢:* ${formatNumber(user.euro)}
*🏦 𝐓𝐨𝐭𝐚𝐥𝐞 𝐛𝐚𝐧𝐜𝐚:* ${formatNumber(user.bank)}
*💰 𝐏𝐚𝐭𝐫𝐢𝐦𝐨𝐧𝐢𝐨:* ${formatNumber(user.euro + user.bank)}`
        ),
        mentions: [target]
      },
      { quoted: m }
    )
  }

  if (amount > user.euro) amount = user.euro

  user.euro -= amount

  return conn.sendMessage(
    m.chat,
    {
      text: box(
        '✅',
        '𝐒𝐎𝐋𝐃𝐈 𝐑𝐈𝐌𝐎𝐒𝐒𝐈',
        `*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* @${target.split('@')[0]}

*💸 𝐑𝐢𝐦𝐨𝐬𝐬𝐢:* ${formatNumber(amount)}
*💼 𝐂𝐨𝐧𝐭𝐚𝐧𝐭𝐢:* ${formatNumber(user.euro)}
*🏦 𝐓𝐨𝐭𝐚𝐥𝐞 𝐛𝐚𝐧𝐜𝐚:* ${formatNumber(user.bank)}
*💰 𝐏𝐚𝐭𝐫𝐢𝐦𝐨𝐧𝐢𝐨:* ${formatNumber(user.euro + user.bank)}`
      ),
      mentions: [target]
    },
    { quoted: m }
  )
}

handler.help = ['addmoney <utente> <quantità>', 'removemoney <utente> <quantità>']
handler.tags = ['owner']
handler.command = /^(addmoney|removemoney)$/i
handler.owner = true

export default handler

function box(emoji, title, body) {
  return `╭━━━━━━━${emoji}━━━━━━━╮
*✦ ${title} ✦*
╰━━━━━━━${emoji}━━━━━━━╯

${body}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
}

function getTarget(m, args) {
  if (m.mentionedJid?.[0]) return m.mentionedJid[0]
  if (m.quoted?.sender) return m.quoted.sender

  const first = args[0]

  if (first && /^\d{5,}$/.test(first.replace(/\D/g, ''))) {
    return first.replace(/\D/g, '') + '@s.whatsapp.net'
  }

  return m.sender
}

function getAmountText(m, args) {
  if (m.mentionedJid?.[0]) {
    return args.slice(1).join('')
  }

  if (m.quoted?.sender) {
    return args.join('')
  }

  const first = args[0]

  if (first && /^\d{5,}$/.test(first.replace(/\D/g, '')) && args.length > 1) {
    return args.slice(1).join('')
  }

  return args.join('')
}

function parseMoney(text = '') {
  const clean = String(text).replace(/[^\d]/g, '')
  return parseInt(clean)
}

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num || 0)
                }
