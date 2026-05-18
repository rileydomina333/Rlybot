// by deadly

import fetch from 'node-fetch'
import { promises as fs } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*⚠️ 𝐑𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌: Inserisci il testo che devo pronunciare.*\n\n*Esempio:* _${usedPrefix}${command} Ciao a tutti_`)

    const tmpDir = path.join(process.cwd(), 'tmp')
    const filename = `${Date.now()}_tts`
    const inputPath = path.join(tmpDir, `${filename}.mp3`)
    const outputPath = path.join(tmpDir, `${filename}.opus`)

    try {
        await fs.mkdir(tmpDir, { recursive: true })

        let ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=it&client=tw-ob`
        let res = await fetch(ttsUrl)
        if (!res.ok) throw new Error()
        
        let buffer = await res.buffer()
        await fs.writeFile(inputPath, buffer)

        await execPromise(`ffmpeg -i "${inputPath}" -c:a libopus -b:a 32k -vbr on "${outputPath}" -y`)

        let convertedBuffer = await fs.readFile(outputPath)

        await conn.sendFile(m.chat, convertedBuffer, 'tts.opus', '', m, true, {
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        })

    } catch (e) {
        return m.reply('*❌ 𝐑𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌: Impossibile generare l\'audio in questo momento.*')
    } finally {
        try { await fs.unlink(inputPath) } catch {}
        try { await fs.unlink(outputPath) } catch {}
    }
}

handler.help = ['parla']
handler.tags = ['group', 'fun']
handler.command = /^(parla|tts)$/i

handler.group = true

export default handler
