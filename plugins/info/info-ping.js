import { performance } from 'perf_hooks'
import os from 'os'

const toMathematicalAlphanumericSymbols = number => {
  const map = {
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒',
    '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗', '.': '.'
  }
  return number.toString().split('').map(d => map[d] || d).join('')
}

const clockString = ms => {
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)

  return `${toMathematicalAlphanumericSymbols(String(days).padStart(2, '0'))}d ` +
         `${toMathematicalAlphanumericSymbols(String(hours).padStart(2, '0'))}h ` +
         `${toMathematicalAlphanumericSymbols(String(minutes).padStart(2, '0'))}m ` +
         `${toMathematicalAlphanumericSymbols(String(seconds).padStart(2, '0'))}s`
}

const handler = async (m, { conn, usedPrefix }) => {
  const start = performance.now()
  await Promise.resolve() // micro tick per avere un ping reale
  const end = performance.now()

  const speed = (end - start).toFixed(4)
  const uptime = clockString(process.uptime() * 1000)
  const ram = `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`

  const caption = `
*⟡ PING CALCOLATO ⟡*

💠 *VELOCITÀ:* ${toMathematicalAlphanumericSymbols(speed)} ms
💠 *ATTIVITÀ:* ${uptime}
💠 *RAM USATA:* ${toMathematicalAlphanumericSymbols(ram)}
💠 *STATO:* Online

`.trim()

  await conn.reply(m.chat, caption, m, {
    buttons: [
      { buttonId: `${usedPrefix}ping`, buttonText: { displayText: '⟡Ping' } },
      { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '⟡Menu' } }
    ],
    footer: 'RLY BOT',
    headerType: 1
  })
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = ['ping', 'p']

export default handler