// by deadly

import fetch from 'node-fetch'
import { promises as fs } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'

const execPromise = promisify(exec)

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*⚠️ 𝐑𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌: Inserisci il testo che devo pronunciare.*\n\n*Esempio:* _${usedPrefix}${command} Ciao a tutti_`)

    const tmpDir = os.tmpdir()
    const filename = `tts_${Date.now()}`
    const inputPath = path.join(tmpDir, `${filename}.mp3`)
    const outputPath = path.join(tmpDir, `${filename}.ogg`)

    try {
        let ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=it&client=tw-ob`
        let res = await fetch(ttsUrl)
        if (!res.ok) throw new Error()
        
        let buffer = await res.buffer()
        await fs.writeFile(inputPath, buffer)

        await execPromise(`ffmpeg -hide_banner -loglevel error -y -i "${inputPath}" -map_metadata -1 -vn -ar 48000 -ac 1 -c:a libopus -b:a 64k -application voip -f ogg "${outputPath}"`)

        let convertedBuffer = await fs.readFile(outputPath)

        await conn.sendMessage(m.chat, {
            audio: convertedBuffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: m })

    } catch (e) {
        return m.reply('*❌ 𝐑𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌: Impossibile generare l\'audio in questo momento.*')
    } finally {
        if (require('fs').existsSync(inputPath)) await fs.unlink(inputPath)
        if (require('fs').existsSync(outputPath)) await fs.unlink(outputPath)
    }
}

handler.help = ['parla']
handler.tags = ['group', 'fun']
handler.command = /^(parla|tts)$/i

handler.group = true

export default handler
