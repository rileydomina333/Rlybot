// Plug-in creato da elixir
import os from 'os'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // — Ping reale —
    const start = process.hrtime.bigint()
    await conn.readMessages([m.key])
    const end = process.hrtime.bigint()
    const latency = (Number(end - start) / 1_000_000).toFixed(2)

    // — Uptime —
    const uptimeMs  = process.uptime() * 1000
    const uptimeStr = clockString(uptimeMs)
    const botStartTime = new Date(Date.now() - uptimeMs)
    const activationTime = botStartTime.toLocaleString('it-IT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })

    // — RAM reale (OS) —
    const totalRam = os.totalmem()
    const freeRam  = os.freemem()
    const usedRam  = totalRam - freeRam
    const ramPct   = ((usedRam / totalRam) * 100).toFixed(1)
    const toMB     = b => (b / 1024 / 1024).toFixed(1)

    // — RAM processo Node —
    const heap = process.memoryUsage()
    const heapUsed  = toMB(heap.heapUsed)
    const heapTotal = toMB(heap.heapTotal)
    const rss       = toMB(heap.rss)

    // — CPU —
    const cpus    = os.cpus()
    const cpuName = cpus[0]?.model?.trim() || 'N/D'
    const cores   = cpus.length

    // — Load average (1 min) —
    const [load1] = os.loadavg()
    const loadStr = load1.toFixed(2)

    // — OS info —
    const platform = os.platform()
    const arch     = os.arch()
    const nodeVer  = process.version

    // — Utenti e gruppi —
    const totalUsers  = Object.keys(global.db.data.users).length
    const totalChats  = Object.entries(conn.chats).filter(([id, d]) => id && d.isChats)
    const totalGroups = totalChats.filter(([id]) => id.endsWith('@g.us')).length
    const totalDMs    = totalChats.filter(([id]) => !id.endsWith('@g.us')).length

    const sep = '▸'

    const message = `
*ʀɪʟᴇʏ ʙᴏᴛ* 🔮 — ꜱʏꜱᴛᴇᴍ ʀᴇᴘᴏʀᴛ
${'─'.repeat(32)}

⚡ *ᴘᴇʀꜰᴏʀᴍᴀɴᴄᴇ*
${sep} ᴘɪɴɢ       » \`${latency} ms\`
${sep} ᴜᴘᴛɪᴍᴇ     » \`${uptimeStr}\`
${sep} ᴀᴠᴠɪᴏ      » \`${activationTime}\`

💾 *ᴍᴇᴍᴏʀɪᴀ*
${sep} ꜱɪꜱᴛᴇᴍᴀ   » \`${toMB(usedRam)} / ${toMB(totalRam)} MB  (${ramPct}%)\`
${sep} ʜᴇᴀᴘ      » \`${heapUsed} / ${heapTotal} MB\`
${sep} ʀꜱꜱ       » \`${rss} MB\`

🖥️ *ꜱɪꜱᴛᴇᴍᴀ*
${sep} ᴄᴘᴜ       » \`${cpuName}\`
${sep} ᴄᴏʀᴇ      » \`${cores}\`
${sep} ʟᴏᴀᴅ      » \`${loadStr}\`
${sep} ᴏꜱ        » \`${platform} / ${arch}\`
${sep} ɴᴏᴅᴇ      » \`${nodeVer}\`

📊 *ꜱᴛᴀᴛɪꜱᴛɪᴄʜᴇ*
${sep} ᴜᴛᴇɴᴛɪ    » \`${totalUsers}\`
${sep} ɢʀᴜᴘᴘɪ    » \`${totalGroups}\`
${sep} ᴅᴍ        » \`${totalDMs}\`

${'─'.repeat(32)}
*ꜱᴛᴀᴛᴜꜱ* » 🟢 ᴏɴʟɪɴᴇ  •  *ᴏᴡɴᴇʀ* » ʀɪʟᴇʏ`.trim()

    await conn.sendMessage(m.chat, {
      text: message,
      contextInfo: {
        externalAdReply: {
          title: 'ʀʟʏʙᴏᴛ • ꜱʏꜱᴛᴇᴍ ʀᴇᴘᴏʀᴛ',
          body: `ᴘɪɴɢ: ${latency}ms  •  ʀᴀᴍ: ${ramPct}%  •  ᴜᴘᴛɪᴍᴇ: ${uptimeStr}`,
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: false,
          sourceUrl: ''
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error('[ping] Errore:', e)
    await conn.reply(m.chat, '❌ Errore nel recupero dei dati di sistema.', m)
  }
}

handler.help    = ['ping']
handler.tags    = ['info']
handler.command = /^(ping)$/i
export default handler

function clockString(ms) {
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1_000)
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
  }
