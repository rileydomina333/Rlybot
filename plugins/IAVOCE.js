import { exec } from 'child_process'
import fs from 'fs'
import { randomUUID } from 'crypto'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Esempio:* ${usedPrefix + command} come va?`)
    if (text.length > 200) return m.reply('Max 200 caratteri.')

    await conn.sendPresenceUpdate('recording', m.chat)

    const fileName = `./tmp/${randomUUID()}.mp3`
    const textPulito = text.replace(/"/g, '\\"') // evita command injection

    try {
        // 1. Genera audio con espeak-ng in italiano
        // -v it = voce italiana, -s 150 = velocità, -p 50 = pitch
        await new Promise((resolve, reject) => {
            exec(`espeak-ng -v it -s 150 -p 50 "${textPulito}" --stdout | ffmpeg -i - -ar 24000 -ac 2 -ab 48k -f mp3 ${fileName}`, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        // 2. Leggi e invia
        let audioBuffer = fs.readFileSync(fileName)
        await conn.sendMessage(m.chat, { 
            audio: audioBuffer, 
            mimetype: 'audio/mpeg',
            ptt: true 
        }, { quoted: m })

    } catch (e) {
        console.log(e)
        m.reply('Errore: espeak-ng non è installato sul server.')
    } finally {
        // 3. Pulisci il file temporaneo
        if (fs.existsSync(fileName)) fs.unlinkSync(fileName)
    }
}

handler.command = /^vocalbot$/i
handler.tags = ['tools']
handler.help = ['vocalbot <testo>']

export default handler