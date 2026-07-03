import { performance } from 'perf_hooks'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// Importa le variabili dal plugin del bot per leggere lo stato
import botHandler from './bot.js' // Assicurati che il file si chiami bot.js

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Funzione per leggere lo stato IA dal plugin bot.js
function getStatoIA(chatId) {
    // Accedi alle variabili esportate dal bot
    const stato = botHandler.iaAttiva?.[chatId]
    if (stato === false) return '❌ OFF'
    if (stato === true) return '✅ ON'
    return '⚪ DEFAULT'
}

const handler = async (message, { conn, usedPrefix, command }) => {
    try {
        const userId = message.sender
        const groupId = message.isGroup? message.chat : null
        const userCount = Object.keys(global.db.data.users).length
        const botName = "ℝ𝕃𝕐 𝔹𝕆𝕋"
        const statoIA = getStatoIA(message.chat)

        const menuText = generateMenuText(usedPrefix, botName, userCount, userId, statoIA)

        const photoPath = path.join(__dirname, '../../media/WA_1782994892103.jpeg')

        const footerText = `Powered by ℝ𝕃𝕐 𝔹𝕆𝕋 ✨`

        await conn.sendMessage(
            message.chat,
            {
                image: fs.existsSync(photoPath)? { url: photoPath } : { url: 'https://i.ibb.co/3mJJ2sS/bot.jpg' },
                caption: menuText,
                footer: footerText,
                buttons: [
                    { buttonId: `${usedPrefix}menuia`, buttonText: { displayText: '🧠 IA' }, type: 1 },
                    { buttonId: `${usedPrefix}menuadmin`, buttonText: { displayText: '💠 Admin' }, type: 1 },
                    { buttonId: `${usedPrefix}menugruppo`, buttonText: { displayText: '💠 Gruppo' }, type: 1 },
                    { buttonId: `${usedPrefix}menusicurezza`, buttonText: { displayText: '💠 Sicurezza' }, type: 1 },
                ],
                viewOnce: true,
                headerType: 4,
                mentions: [userId]
            },
            { quoted: message }
        )
    } catch (e) {
        console.error('❌ Errore nel menu principale:', e)
        conn.reply(message.chat, '❌ Errore nel caricamento del menu. Controlla la console.', message)
    }
}

handler.help = ['menu']
handler.tags = ['menu']
handler.command = /^(menu|comandi|commands|menú|comandos)$/i

export default handler

function generateMenuText(prefix, botName, userCount, userId, statoIA) {
    const vs = global.vs || '2.0.0'

    return `
┏━━〔 💠 *${botName}* 💠 〕━━┓
┃
┃ 💠 *Utente:* @${userId.split('@')[0]}
┃ 💠 *Utenti DB:* ${userCount}
┃ 💠 *Versione:* ${vs}
┃ 💠 *Stato IA:* ${statoIA}
┃
┣━━〔 🧠 *INTELLIGENZA* 〕━━┓
┃ 💠 \`${prefix}bot on\` → Attiva IA
┃ 💠 \`${prefix}bot off\` → Disattiva IA
┃ 💠 \`${prefix}bot incazzati\` → Mod aggressiva
┃ 💠 \`${prefix}bot calmati\` → Mod gentile
┃ 💠 \`${prefix}bot <testo>\` → Parla con RLY
┃
┣━━〔 💠 *SISTEMA* 〕━━┓
┃ 💠 \`${prefix}ping\`
┃ 💠 \`${prefix}uptime\`
┃ 💠 \`${prefix}server\`
┃
┣━━〔 💠 *TOOLS* 〕━━┓
┃ 💠 \`${prefix}vocebot <testo>\` → TTS
┃ 💠 \`${prefix}palermo <testo>\` → TTS dialetto
┃ 💠 \`${prefix}traduttore <testo>\`
┃
┣━━〔 💠 *ASSISTENZA* 〕━━┓
┃ 💠 \`${prefix}report <bug>\`
┃ 💠 \`${prefix}suggerisci <idea>\`
┃ 💠 \`${prefix}owner\`
┃
┗━━━━━━━━━━━━━━━━━━┛`.trim()
}