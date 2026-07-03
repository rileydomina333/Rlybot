import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Esempio:* ${usedPrefix + command} come va?`)
    if (text.length > 200) return m.reply('Max 200 caratteri.')

    await conn.sendPresenceUpdate('recording', m.chat)

    // 1. Crea cartella tmp se non esiste
    const tmpDir = './tmp'
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

    const fileName = path.join(tmpDir, `${randomUUID()}.mp3`)
    const textPulito = text.replace(/"/g, '\\"').replace(/`/g, '\\`')

    try {
        // 2. Controlla se espeak-ng esiste
        await new Promise((resolve, reject) => {
            exec('which espeak-ng', (err) => {
                if (err) reject('ESPEAK_MANCANTE')
                else resolve()
            })
        })

        // 3. Genera audio
        await new Promise((resolve, reject) => {
            exec(`espeak-ng -v it -s 150 -p 50 "${textPulito}" --stdout | ffmpeg -i - -ar 24000 -c:a libmp3lame -b:a 48k -f mp3 ${fileName}`, (err, stdout, stderr) => {
                if (err) {
                    console.log('Errore espeak/ffmpeg:', stderr)
                    reject('ERRORE_GENERAZIONE')
                } else resolve()
            })
        })

        // 4. Controlla se il file è stato creato
        if (!fs.existsSync(fileName)) throw 'FILE_NON_CREATO'

        let audioBuffer = fs.readFileSync(fileName)
        await conn.sendMessage(m.chat, { 
            audio: audioBuffer, 
            mimetype: 'audio/mpeg',
            ptt: true 
        }, { quoted: m })

    } catch (e) {
        console.log(e)
        if (e === 'ESPEAK_MANCANTE') {
            m.reply('❌ Errore: espeak-ng non installato.\nEsegui sul server:\n`sudo apt install espeak-ng ffmpeg -y`')
        } else if (e === 'ERRORE_GENERAZIONE') {
            m.reply('❌ Errore: ffmpeg non installato.\nEsegui sul server:\n`sudo apt install ffmpeg -y`')
        } else {
            m.reply('❌ Errore nella generazione audio. Controlla i log.')
        }
    } finally {
        // 5. Pulisci sempre il file
        if (fs.existsSync(fileName)) fs.unlinkSync(fileName)
    }
}

handler.command = /^audio$/i
handler.tags = ['tools']
handler.help = ['audio <testo>']

export default handler