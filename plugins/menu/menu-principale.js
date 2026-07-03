import { performance } from 'perf_hooks'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let statoIA = {}
let modalitaIncazzata = {}
try {
    const botData = await import('./bot.js')
    statoIA = botData.iaAttiva || {}
    modalitaIncazzata = botData.modalitaIncazzata || {}
} catch {}

function formatUptime() {
    let uptime = process.uptime() * 1000
    let d = Math.floor(uptime / 86400000)
    let h = Math.floor(uptime / 3600000) % 24
    let m = Math.floor(uptime / 60000) % 60
    return `${d}d ${h}h ${m}m`
}

function getIAStatus(chatId) {
    if (statoIA[chatId] === false) return '[OFFLINE]'
    if (modalitaIncazzata[chatId]) return '[RAGE MODE]'
    if (statoIA[chatId] === true) return '[ONLINE]'
    return '[STANDBY]'
}

const handler = async (m, { conn, usedPrefix }) => {
    let start = performance.now()
    let speed = (performance.now() - start).toFixed(2)

    let totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1)
    let usedRAM = (process.memoryUsage().heapUsed / 1024).toFixed(1)
    let cpu = os.cpus()[0].model.split(' ')[0]

    const users = Object.keys(global.db.data.users).length
    const chats = Object.keys(global.db.data.chats).length
    const user = m.sender
    const botName = "RLY//CORE"
    const iaStatus = getIAStatus(m.chat)

    const menuText = `
╔═══════════════════════╗
║ ◢◤ ${botName} v2.1 ◥◣ ║
╚═══════════════════════╝

> USER: @${user.split('@')[0]}
> PING: ${speed}ms
> UPTIME: ${formatUptime()}

┌─[ CORE STATUS ]─────────┐
│ RAM: ${usedRAM}MB / ${totalRAM}GB
│ CPU: ${cpu}
│ USERS: ${users} CHATS: ${chats}
│ IA CORE: ${iaStatus}
└─────────────────────────┘

┌─[ AI MODULE ]───────────
│ ${usedPrefix}bot on/off
│ ${usedPrefix}bot incazzati/calmati
│ ${usedPrefix}bot <query>
└─────────────────────────

┌─[ AUDIO MODULE ]────────
│ ${usedPrefix}vocebot <txt>
│ ${usedPrefix}palermo <txt>
└─────────────────────────

┌─[ SYSTEM MODULE ]───────
│ ${usedPrefix}ping
│ ${usedPrefix}owner
│ ${usedPrefix}report <bug>
└─────────────────────────

╚══[ SELECT OPTION ]══╝`.trim()

    const imgPath = path.join(__dirname, '../../media/menu.jpg')

    // Messaggio base senza immagine
    let messageContent = {
        text: menuText,
        footer: `© ${botName} | Riley Systems`,
        buttons: [
            { buttonId: `${usedPrefix}bot on`, buttonText: { displayText: '🟢 ATTIVA IA' }, type: 1 },
            { buttonId: `${usedPrefix}bot off`, buttonText: { displayText: '🔴 STOP IA' }, type: 1 },
            { buttonId: `${usedPrefix}ping`, buttonText: { displayText: '📊 STATUS' }, type: 1 },
            { buttonId: `${usedPrefix}owner`, buttonText: { displayText: '👑 OWNER' }, type: 1 },
        ],
        headerType: 1,
        mentions: [user]
    }

    // Aggiungi immagine SOLO se il file esiste davvero
    if (fs.existsSync(imgPath)) {
        messageContent = {
            image: fs.readFileSync(imgPath),
            caption: menuText,
            footer: `© ${botName} | Riley Systems`,
            buttons: messageContent.buttons,
            headerType: 4,
            mentions: [user]
        }
    }

    await conn.sendMessage(m.chat, messageContent, { quoted: m })
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|help|comandi)$/i

export default handler