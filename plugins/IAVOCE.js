import gTTS from 'gtts'
import { exec } from 'child_process'
import fs from 'fs'
import { randomUUID } from 'crypto'
import path from 'path'

function palermitano(text) {
    return text
        .replace(/che/g, 'chi')
        .replace(/perché/g, 'picchì')
        .replace(/cosa/g, 'che cosa')
        .replace(/andiamo/g, 'ammu a ghiiri')
        .replace(/ragazzo/g, 'picciotto')
        .replace(/bello/g, 'beddu')
        .replace(/ciao/g, 'ue')
        .replace(/\?/g, ' ah?')
}

let handler = async (m, { conn, text, usedPrefix }) => {
    if (!text) return m.reply(`Esempio: ${usedPrefix}palermo come va`)

    await conn.sendPresenceUpdate('recording', m.chat)

    const tmpDir = './tmp'
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
    
    const id = randomUUID()
    const mp3Path = path.join(tmpDir, `${id}.mp3`)
    const oggPath = path.join(tmpDir, `${id}.ogg`)
    const testoPalermo = palermitano(text.toLowerCase())

    try {
        // 1. Genera con testo modificato
        await new Promise((resolve, reject) => {
            new gTTS(testoPalermo, 'it').save(mp3Path, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        // 2. Abbassa pitch + rallenta per fare voce più "grezza" da picciotto
        // asetrate=44100*0.8 = rallenta, atempo=1.2 = ricompensa durata
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${mp3Path} -af "asetrate=44100*0.85,aresample=44100,atempo=1.1" -ar 48000 -ac 1 -c:a libopus ${oggPath}`, (err) => {
                if (err) reject('FFMPEG_ERROR')
                else resolve()
            })
        })

        let audioBuffer = fs.readFileSync(oggPath)
        await conn.sendMessage(m.chat, { 
            audio: audioBuffer, 
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true 
        }, { quoted: m })

    } catch (e) {
        console.log(e)
        m.reply(`❌ Errore: serve ffmpeg installato`)
    } finally {
        if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path)
        if (fs.existsSync(oggPath)) fs.unlinkSync(oggPath)
    }
}

handler.command = /^vocebot$/i
handler.help = ['vocebot <testo>']

export default handler