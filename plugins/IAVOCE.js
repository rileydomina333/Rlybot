import gTTS from 'gtts'
import { exec } from 'child_process'
import fs from 'fs'
import { randomUUID } from 'crypto'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix }) => {
    if (!text) return m.reply(`Esempio: ${usedPrefix}vocebot come va`)
    if (text.length > 200) return m.reply('Max 200 caratteri')

    await conn.sendPresenceUpdate('recording', m.chat)

    const tmpDir = './tmp'
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
    
    const id = randomUUID()
    const mp3Path = path.join(tmpDir, `${id}.mp3`)
    const oggPath = path.join(tmpDir, `${id}.ogg`)

    try {
        // 1. Genera MP3 con gtts
        await new Promise((resolve, reject) => {
            new gTTS(text, 'it').save(mp3Path, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        // 2. Converti in OGG OPUS che WhatsApp digerisce sempre
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${mp3Path} -ar 48000 -ac 1 -c:a libopus ${oggPath}`, (err) => {
                if (err) {
                    console.log('Errore FFMPEG:', err)
                    reject('FFMPEG_ERROR')
                } else resolve()
            })
        })

        // 3. Invia come vocale
        let audioBuffer = fs.readFileSync(oggPath)
        await conn.sendMessage(m.chat, { 
            audio: audioBuffer, 
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true 
        }, { quoted: m })

    } catch (e) {
        console.log(e)
        if (e === 'FFMPEG_ERROR') {
            m.reply('❌ Manca ffmpeg sul server.\nEsegui: `sudo apt install ffmpeg -y`')
        } else {
            m.reply(`❌ Errore: ${e.message}\nHai fatto npm install gtts?`)
        }
    } finally {
        // 4. Pulisci i file temporanei
        if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path)
        if (fs.existsSync(oggPath)) fs.unlinkSync(oggPath)
    }
}

handler.command = /^vocebot$/i
handler.tags = ['tools']
handler.help = ['vocebot <testo>']

export default handler