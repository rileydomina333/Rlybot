import gTTS from 'gtts'
import fs from 'fs'
import { randomUUID } from 'crypto'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Esempio:* ${usedPrefix + command} come va?`)
    if (text.length > 200) return m.reply('Max 200 caratteri.')

    await conn.sendPresenceUpdate('recording', m.chat)

    const tmpDir = './tmp'
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
    
    const filePath = path.join(tmpDir, `${randomUUID()}.mp3`)

    try {
        // Genera audio con gtts
        const gtts = new gTTS(text, 'it')
        
        await new Promise((resolve, reject) => {
            gtts.save(filePath, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        let audioBuffer = fs.readFileSync(filePath)
        await conn.sendMessage(m.chat, { 
            audio: audioBuffer, 
            mimetype: 'audio/mpeg',
            ptt: true 
        }, { quoted: m })

    } catch (e) {
        console.log(e)
        m.reply('❌ Errore TTS. Prova: `npm install gtts`')
    } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
}

handler.command = /^vocebot$/i
handler.tags = ['tools']
handler.help = ['vocebot <testo>']

export default handler