import { writeFile, readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const handler = async (m, { conn, args, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!/image|video/.test(mime)) 
        return m.reply(`Rispondi a foto/video con ${usedPrefix + command}`)
    
    if (/video/.test(mime) && (q.msg || q).seconds > 10) 
        return m.reply('Video max 10s')
    
    await m.react('⏳')
    const tmp = join(tmpdir(), `${Date.now()}`)
    
    try {
        let media = await q.download()
        await writeFile(`${tmp}`, media)
        
        let packname = args[0] || 'RLY BOT'
        let author = args[1] || 'WhatsApp'
        
        // Converti con ffmpeg direttamente in webp
        if (/image/.test(mime)) {
            await execAsync(`ffmpeg -i ${tmp} -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ${tmp}.webp`)
        } else {
            await execAsync(`ffmpeg -i ${tmp} -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" -t 10 -loop 0 ${tmp}.webp`)
        }
        
        let stickerBuffer = await readFile(`${tmp}.webp`)
        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
        await m.react('✅')
        
        // Pulisci file temp
        unlink(`${tmp}`).catch(() => {})
        unlink(`${tmp}.webp`).catch(() => {})
        
    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply(`Errore: assicurati di avere ffmpeg installato\nComando: apt install ffmpeg -y`)
    }
}

handler.help = ['sticker', 's']
handler.tags = ['converter']
handler.command = /^s(tic?ker)?$/i

export default handler