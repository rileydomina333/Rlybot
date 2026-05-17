// ✦ Plugin fatto da Deadly 

let handler = async (m, { isOwner, isAdmin, conn, participants, args }) => {
    if (!(isAdmin || isOwner)) return

    let nomebot = conn.user.name || '𝐁𝐎𝐓'
    let message = args.join(' ') || '𝑁𝑒𝑠𝑠𝑢𝑛 𝑚𝑒𝑠𝑠𝑎𝑔𝑔𝑖𝑜'

    const getFlag = (num) => {

        const flags = {

            // 🇪🇺 Europa
            '39': '🇮🇹',
            '44': '🇬🇧',
            '33': '🇫🇷',
            '34': '🇪🇸',
            '49': '🇩🇪',
            '41': '🇨🇭',
            '43': '🇦🇹',
            '31': '🇳🇱',
            '32': '🇧🇪',
            '351': '🇵🇹',
            '30': '🇬🇷',
            '48': '🇵🇱',
            '40': '🇷🇴',
            '46': '🇸🇪',
            '47': '🇳🇴',
            '45': '🇩🇰',
            '358': '🇫🇮',
            '36': '🇭🇺',
            '420': '🇨🇿',
            '421': '🇸🇰',
            '385': '🇭🇷',
            '386': '🇸🇮',
            '355': '🇦🇱',
            '380': '🇺🇦',
            '7': '🇷🇺',

            // 🌎 America
            '1': '🇺🇸',
            '52': '🇲🇽',
            '55': '🇧🇷',
            '54': '🇦🇷',
            '56': '🇨🇱',
            '57': '🇨🇴',
            '58': '🇻🇪',
            '51': '🇵🇪',
            '53': '🇨🇺',

            // 🌏 Asia
            '81': '🇯🇵',
            '82': '🇰🇷',
            '86': '🇨🇳',
            '91': '🇮🇳',
            '92': '🇵🇰',
            '90': '🇹🇷',
            '62': '🇮🇩',
            '63': '🇵🇭',
            '66': '🇹🇭',
            '84': '🇻🇳',
            '60': '🇲🇾',
            '65': '🇸🇬',
            '971': '🇦🇪',
            '966': '🇸🇦',
            '972': '🇮🇱',

            // 🌍 Africa
            '20': '🇪🇬',
            '212': '🇲🇦',
            '213': '🇩🇿',
            '216': '🇹🇳',
            '27': '🇿🇦',
            '234': '🇳🇬',
            '251': '🇪🇹',
            '254': '🇰🇪',

            // 🏝️ Oceania
            '61': '🇦🇺',
            '64': '🇳🇿',
        }

        let prefixes = Object.keys(flags).sort((a, b) => b.length - a.length)

        for (let prefix of prefixes) {
            if (num.startsWith(prefix)) {
                return flags[prefix]
            }
        }

        return '🌍'
    }

    let text = `
╔══════════════════╗
        🔔 𝐓𝐀𝐆 𝐀𝐋𝐋 🔔
╚══════════════════╝

🤖 𝐁𝐨𝐭: ${nomebot}

🗣️ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨:
➤ ${message}

━━━━━━━━━━━━━━━━━━━
👥 𝐌𝐄𝐌𝐁𝐑𝐈 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐏𝐎
━━━━━━━━━━━━━━━━━━━
`

    for (let user of participants) {

        let number = user.id.split('@')[0]
        let flag = getFlag(number)

        text += `✦ ${flag} @${number}\n`
    }

    text += `
━━━━━━━━━━━━━━━━━━━
✨ Powered By Deadly
`

    let pp

    try {
        pp = await conn.profilePictureUrl(m.sender, 'image')
    } catch {
        pp = 'https://i.ibb.co/rF7S0Yk/avatar-contact.png'
    }

    await conn.sendMessage(
        m.chat,
        {
            text,
            mentions: participants.map(p => p.id),

            contextInfo: {
                externalAdReply: {
                    title: '🔔 TAG ALL PREMIUM',
                    body: 'Invocazione membri del gruppo',
                    thumbnailUrl: pp,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    showAdAttribution: false
                }
            }
        },
        { quoted: m }
    )
}

handler.command = /^(tagall|invocar|marcar|todos)$/i
handler.group = true
handler.admin = true

export default handler